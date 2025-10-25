import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('photo_analyses')
@Index(['patientId'])
export class PhotoAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  patientId: string;

  @Column({ type: 'varchar' })
  photoUrl: string;

  @Column({ type: 'int' })
  daysPostOp: number;

  @Column({ type: 'varchar' })
  procedureType: string;

  // AI Analysis Results
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  recoveryScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceLevel: number;

  @Column({
    type: 'enum',
    enum: ['none', 'low', 'medium', 'high', 'critical'],
    default: 'none'
  })
  overallSeverity: string;

  // Hematoma
  @Column({ type: 'boolean', default: false })
  hasHematoma: boolean;

  @Column({ type: 'int', default: 0 })
  hematomaSeverity: number;

  // Edema
  @Column({ type: 'boolean', default: false })
  hasEdema: boolean;

  @Column({ type: 'int', default: 0 })
  edemaSeverity: number;

  // Infection
  @Column({ type: 'boolean', default: false })
  hasInfection: boolean;

  @Column({ type: 'int', default: 0 })
  infectionSeverity: number;

  // Asymmetry
  @Column({ type: 'boolean', default: false })
  hasAsymmetry: boolean;

  @Column({ type: 'int', default: 0 })
  asymmetrySeverity: number;

  // Other complications
  @Column({ type: 'boolean', default: false })
  hasDehiscence: boolean;

  @Column({ type: 'boolean', default: false })
  hasNecrosis: boolean;

  @Column({ type: 'boolean', default: false })
  hasSeroma: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  detectedFeatures: any;

  @Column({ type: 'jsonb', nullable: true })
  recommendations: any;

  @Column({ type: 'boolean', default: false })
  requiresDoctorReview: boolean;

  @Column({ type: 'boolean', default: false })
  alertSent: boolean;

  @Column({ type: 'text', nullable: true })
  aiNotes: string;

  @Column({ type: 'text', nullable: true })
  doctorNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  reviewedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
