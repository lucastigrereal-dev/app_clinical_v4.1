/**
 * Mock data for testing when backend is not available
 * Remove this file when connecting to real API
 */
import { Patient, TimelineItem } from '@/types/api';

export const mockPatients: Patient[] = [
  { id: 1, name: "John Smith", clinicId: 1001 },
  { id: 2, name: "Maria Garcia", clinicId: 1001 },
  { id: 3, name: "David Johnson", clinicId: 1002 },
  { id: 4, name: "Sarah Wilson", clinicId: 1001 },
  { id: 5, name: "Michael Brown", clinicId: 1003 },
  { id: 6, name: "Emma Davis", clinicId: 1002 },
];

export const mockTimeline: TimelineItem[] = [
  {
    id: 1,
    date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    title: "Initial Consultation",
    description: "First patient visit for treatment evaluation and baseline assessment. Medical history reviewed, initial examination completed.",
    phase: "D0"
  },
  {
    id: 2,
    date: new Date(Date.now() - 335 * 24 * 60 * 60 * 1000).toISOString(),
    title: "30-Day Follow-up",
    description: "First follow-up appointment to assess treatment progress and adjust medication if necessary. Patient reported positive response.",
    phase: "D30"
  },
  {
    id: 3,
    date: new Date(Date.now() - 275 * 24 * 60 * 60 * 1000).toISOString(),
    title: "90-Day Assessment",
    description: "Comprehensive evaluation at 90-day mark. Treatment efficacy reviewed, side effects assessed, lifestyle recommendations provided.",
    phase: "D90"
  },
  {
    id: 4,
    date: new Date(Date.now() - 183 * 24 * 60 * 60 * 1000).toISOString(),
    title: "6-Month Review",
    description: "Mid-treatment evaluation showing significant improvement. Treatment plan adjusted based on patient progress and feedback.",
    phase: "M6"
  },
  {
    id: 5,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    title: "12-Month Final Assessment",
    description: "Final treatment evaluation with comprehensive outcome assessment. Treatment goals achieved, maintenance plan established.",
    phase: "M12"
  }
];

// Mock API responses for testing
export const mockApiResponses = {
  login: { token: "mock_jwt_token_for_testing" },
  patients: mockPatients,
  patient: mockPatients[0],
  timeline: mockTimeline,
  photoUpload: { id: 1, url: "/mock-photo.jpg", uploadedAt: new Date().toISOString() }
};