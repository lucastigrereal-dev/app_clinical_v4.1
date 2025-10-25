import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create a new payment intent (Stripe)' })
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto);
  }

  @Post('confirm/:paymentIntentId')
  @ApiOperation({ summary: 'Confirm a payment' })
  async confirmPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all payments for a patient' })
  async getPatientPayments(@Param('patientId') patientId: string) {
    return this.paymentsService.findByPatient(patientId);
  }

  @Post('refund/:id')
  @ApiOperation({ summary: 'Refund a payment' })
  async refundPayment(@Param('id') id: string) {
    return this.paymentsService.refundPayment(id);
  }

  @Get('stripe/:paymentIntentId')
  @ApiOperation({ summary: 'Get payment by Stripe Payment Intent ID' })
  async getPaymentByStripeId(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.findByStripePaymentIntentId(paymentIntentId);
  }
}
