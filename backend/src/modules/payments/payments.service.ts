import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment } from './entities/payment.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {
    this.initializeStripe();
  }

  private initializeStripe() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      this.logger.warn('⚠️ STRIPE_SECRET_KEY not found. Payments will not work.');
      this.logger.warn('💡 Set STRIPE_SECRET_KEY in .env to enable Stripe payments.');
      // Use test key for development
      this.stripe = new Stripe('sk_test_dummy_key_for_development', {
        apiVersion: '2025-09-30.clover',
      });
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-09-30.clover',
      });
      this.logger.log('💳 Stripe initialized successfully');
    }
  }

  /**
   * Cria um Payment Intent no Stripe e salva no banco
   */
  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    try {
      this.logger.log(`💳 Creating payment intent for patient: ${dto.patientId}`);

      // Create Stripe Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amount,
        currency: dto.currency || 'brl',
        description: dto.description,
        metadata: {
          patientId: dto.patientId,
          ...dto.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Save to database
      const payment = this.paymentRepository.create({
        patientId: dto.patientId,
        appointmentId: dto.metadata?.appointmentId,
        stripePaymentIntentId: paymentIntent.id,
        amount: dto.amount / 100, // Convert cents to currency
        currency: dto.currency || 'BRL',
        status: 'pending',
        description: dto.description,
        metadata: dto.metadata,
      });

      await this.paymentRepository.save(payment);

      this.logger.log(`✅ Payment intent created: ${paymentIntent.id}`);

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: dto.amount,
        currency: dto.currency || 'BRL',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to create payment intent: ${error.message}`);
      throw new BadRequestException(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirma um pagamento
   */
  async confirmPayment(paymentIntentId: string) {
    try {
      this.logger.log(`💳 Confirming payment: ${paymentIntentId}`);

      const payment = await this.paymentRepository.findOne({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with Stripe ID ${paymentIntentId} not found`);
      }

      // Retrieve from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Update payment status
      payment.status = paymentIntent.status === 'succeeded' ? 'succeeded' : paymentIntent.status;
      payment.paymentMethod = paymentIntent.payment_method as string;

      if (paymentIntent.status === 'succeeded') {
        payment.paidAt = new Date();
        this.logger.log(`✅ Payment succeeded: ${paymentIntentId}`);
      }

      await this.paymentRepository.save(payment);

      return payment;
    } catch (error) {
      this.logger.error(`❌ Failed to confirm payment: ${error.message}`);
      throw new BadRequestException(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Reembolsa um pagamento
   */
  async refundPayment(paymentId: string) {
    try {
      this.logger.log(`💳 Refunding payment: ${paymentId}`);

      const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });

      if (!payment) {
        throw new NotFoundException(`Payment ${paymentId} not found`);
      }

      if (payment.status !== 'succeeded') {
        throw new BadRequestException('Can only refund succeeded payments');
      }

      // Create refund in Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });

      // Update payment status
      payment.status = 'refunded';
      await this.paymentRepository.save(payment);

      this.logger.log(`✅ Payment refunded: ${paymentId}`);

      return {
        paymentId: payment.id,
        refundId: refund.id,
        status: 'refunded',
        amount: payment.amount,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to refund payment: ${error.message}`);
      throw new BadRequestException(`Failed to refund payment: ${error.message}`);
    }
  }

  /**
   * Busca pagamento por ID
   */
  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return payment;
  }

  /**
   * Busca pagamentos de um paciente
   */
  async findByPatient(patientId: string) {
    return this.paymentRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca por Stripe Payment Intent ID
   */
  async findByStripePaymentIntentId(paymentIntentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with Stripe ID ${paymentIntentId} not found`);
    }

    return payment;
  }

  /**
   * Webhook handler para eventos do Stripe
   */
  async handleStripeWebhook(event: Stripe.Event) {
    this.logger.log(`📨 Received Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(failedIntent);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'succeeded';
      payment.paidAt = new Date();

      // Retrieve with expand to get charges
      const expandedIntent: any = await this.stripe.paymentIntents.retrieve(paymentIntent.id, {
        expand: ['charges.data.receipt_url'],
      });

      payment.receiptUrl = expandedIntent.charges?.data?.[0]?.receipt_url || null;
      await this.paymentRepository.save(payment);

      this.logger.log(`✅ Payment succeeded webhook processed: ${paymentIntent.id}`);
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'failed';
      payment.failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';
      await this.paymentRepository.save(payment);

      this.logger.log(`❌ Payment failed webhook processed: ${paymentIntent.id}`);
    }
  }
}
