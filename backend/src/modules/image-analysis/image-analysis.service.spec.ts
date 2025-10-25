import { Test, TestingModule } from '@nestjs/testing';
import {
  ImageAnalysisService,
  ImageAnalysis,
} from './image-analysis.service';

describe('ImageAnalysisService', () => {
  let service: ImageAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageAnalysisService],
    }).compile();

    service = module.get<ImageAnalysisService>(ImageAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyze', () => {
    it('should analyze an image and return results', async () => {
      const patientId = 'patient-123';
      const imageUrl = 'https://example.com/image.jpg';

      const result = await service.analyze(patientId, imageUrl);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.patientId).toBe(patientId);
      expect(result.imageUrl).toBe(imageUrl);
      expect(result.analysisResult).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should return confidence score between 0 and 1', async () => {
      const result = await service.analyze('patient-123', 'image.jpg');

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should generate unique IDs for different analyses', async () => {
      const analysis1 = await service.analyze('patient-123', 'image1.jpg');
      await new Promise(resolve => setTimeout(resolve, 10));
      const analysis2 = await service.analyze('patient-123', 'image2.jpg');

      expect(analysis1.id).not.toBe(analysis2.id);
    });

    it('should store analysis in memory', async () => {
      const patientId = 'patient-123';
      await service.analyze(patientId, 'image.jpg');

      const analyses = await service.findByPatientId(patientId);

      expect(analyses).toHaveLength(1);
    });

    it('should handle multiple images for same patient', async () => {
      const patientId = 'patient-123';
      await service.analyze(patientId, 'image1.jpg');
      await service.analyze(patientId, 'image2.jpg');
      await service.analyze(patientId, 'image3.jpg');

      const analyses = await service.findByPatientId(patientId);

      expect(analyses).toHaveLength(3);
    });

    it('should handle different image URL formats', async () => {
      const urls = [
        'https://example.com/image.jpg',
        'http://cdn.example.com/images/scan.png',
        '/local/path/to/image.jpeg',
        'data:image/png;base64,iVBORw0KGgoAAAANS...',
      ];

      for (const url of urls) {
        const result = await service.analyze('patient-123', url);
        expect(result.imageUrl).toBe(url);
      }
    });

    it('should create timestamp for each analysis', async () => {
      const before = new Date();
      const analysis = await service.analyze('patient-123', 'image.jpg');
      const after = new Date();

      expect(analysis.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(analysis.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('findByPatientId', () => {
    it('should return all analyses for a patient', async () => {
      const patientId = 'patient-123';
      await service.analyze(patientId, 'image1.jpg');
      await service.analyze(patientId, 'image2.jpg');

      const result = await service.findByPatientId(patientId);

      expect(result).toHaveLength(2);
      expect(result.every((a) => a.patientId === patientId)).toBe(true);
    });

    it('should return empty array for patient with no analyses', async () => {
      const result = await service.findByPatientId('non-existent-patient');

      expect(result).toEqual([]);
    });

    it('should not return analyses from other patients', async () => {
      await service.analyze('patient-123', 'image1.jpg');
      await service.analyze('patient-456', 'image2.jpg');

      const result = await service.findByPatientId('patient-123');

      expect(result).toHaveLength(1);
      expect(result[0].patientId).toBe('patient-123');
    });

    it('should return analyses in order they were created', async () => {
      const patientId = 'patient-123';
      const a1 = await service.analyze(patientId, 'image1.jpg');
      const a2 = await service.analyze(patientId, 'image2.jpg');
      const a3 = await service.analyze(patientId, 'image3.jpg');

      const result = await service.findByPatientId(patientId);

      expect(result.map((a) => a.id)).toEqual([a1.id, a2.id, a3.id]);
    });

    it('should handle multiple patients with analyses', async () => {
      for (let i = 0; i < 5; i++) {
        await service.analyze(`patient-${i}`, `image-${i}.jpg`);
      }

      const patient2Analyses = await service.findByPatientId('patient-2');

      expect(patient2Analyses).toHaveLength(1);
      expect(patient2Analyses[0].patientId).toBe('patient-2');
    });
  });

  describe('findOne', () => {
    it('should return specific analysis by ID', async () => {
      const analysis = await service.analyze('patient-123', 'image.jpg');

      const result = await service.findOne(analysis.id);

      expect(result).toEqual(analysis);
    });

    it('should return null for non-existent analysis', async () => {
      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });

    it('should find analysis among many', async () => {
      await service.analyze('patient-1', 'image1.jpg');
      await new Promise(resolve => setTimeout(resolve, 10));
      const target = await service.analyze('patient-2', 'image2.jpg');
      await new Promise(resolve => setTimeout(resolve, 10));
      await service.analyze('patient-3', 'image3.jpg');

      const result = await service.findOne(target.id);

      expect(result?.id).toBe(target.id);
      expect(result?.patientId).toBe(target.patientId);
      expect(result?.imageUrl).toBe(target.imageUrl);
    });

    it('should return correct analysis even with same patient', async () => {
      const patientId = 'patient-123';
      const a1 = await service.analyze(patientId, 'image1.jpg');
      await service.analyze(patientId, 'image2.jpg');

      const result = await service.findOne(a1.id);

      expect(result?.imageUrl).toBe('image1.jpg');
    });
  });

  describe('delete', () => {
    it('should delete an analysis', async () => {
      const analysis = await service.analyze('patient-123', 'image.jpg');

      await service.delete(analysis.id);
      const result = await service.findOne(analysis.id);

      expect(result).toBeNull();
    });

    it('should handle deleting non-existent analysis', async () => {
      await expect(service.delete('non-existent-id')).resolves.not.toThrow();
    });

    it('should only delete specified analysis', async () => {
      const a1 = await service.analyze('patient-123', 'image1.jpg');
      const a2 = await service.analyze('patient-123', 'image2.jpg');

      await service.delete(a1.id);
      const remaining = await service.findByPatientId('patient-123');

      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(a2.id);
    });

    it('should handle deleting all analyses for a patient', async () => {
      const patientId = 'patient-123';
      const a1 = await service.analyze(patientId, 'image1.jpg');
      const a2 = await service.analyze(patientId, 'image2.jpg');

      await service.delete(a1.id);
      await service.delete(a2.id);
      const result = await service.findByPatientId(patientId);

      expect(result).toEqual([]);
    });

    it('should not affect other patients analyses', async () => {
      const a1 = await service.analyze('patient-123', 'image1.jpg');
      await service.analyze('patient-456', 'image2.jpg');

      await service.delete(a1.id);
      const patient456Analyses = await service.findByPatientId('patient-456');

      expect(patient456Analyses).toHaveLength(1);
    });
  });

  describe('Mock AI Behavior', () => {
    it('should return mock analysis result', async () => {
      const result = await service.analyze('patient-123', 'image.jpg');

      expect(result.analysisResult).toContain('Mock');
    });

    it('should return consistent confidence score', async () => {
      const results = await Promise.all([
        service.analyze('patient-1', 'image1.jpg'),
        service.analyze('patient-2', 'image2.jpg'),
        service.analyze('patient-3', 'image3.jpg'),
      ]);

      expect(results.every((r) => r.confidence === 0.85)).toBe(true);
    });

    it('should prepare for real AI integration', async () => {
      // This test documents the structure expected from real AI
      const result = await service.analyze('patient-123', 'xray.jpg');

      expect(result).toHaveProperty('analysisResult');
      expect(result).toHaveProperty('confidence');
      expect(typeof result.analysisResult).toBe('string');
      expect(typeof result.confidence).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long image URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.jpg';
      const result = await service.analyze('patient-123', longUrl);

      expect(result.imageUrl).toBe(longUrl);
    });

    it('should handle special characters in URLs', async () => {
      const specialUrl =
        'https://example.com/images/scan%20(1)%20-%20копия.jpg?param=value&other=123';
      const result = await service.analyze('patient-123', specialUrl);

      expect(result.imageUrl).toBe(specialUrl);
    });

    it('should handle rapid consecutive analyses', async () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        const r = await service.analyze('patient-123', `image${i}.jpg`);
        results.push(r);
        // Small delay between analyses
        if (i % 2 === 0) await new Promise(resolve => setTimeout(resolve, 5));
      }

      expect(results).toHaveLength(10);
      // All analyses should be created
      expect(results.every(r => r.id && r.imageUrl)).toBe(true);
    });

    it('should handle data URI images', async () => {
      const dataUri =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
        'AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO' +
        '9TXL0Y4OHwAAAABJRU5ErkJggg==';
      const result = await service.analyze('patient-123', dataUri);

      expect(result.imageUrl).toBe(dataUri);
    });

    it('should handle many patients with many images', async () => {
      for (let patientNum = 0; patientNum < 10; patientNum++) {
        for (let imageNum = 0; imageNum < 5; imageNum++) {
          await service.analyze(
            `patient-${patientNum}`,
            `image-${patientNum}-${imageNum}.jpg`,
          );
        }
      }

      const patient5Analyses = await service.findByPatientId('patient-5');

      expect(patient5Analyses).toHaveLength(5);
    });

    it('should preserve all analysis data after multiple operations', async () => {
      const analysis = await service.analyze('patient-123', 'critical.jpg');
      const analysisId = analysis.id;

      // Perform other operations
      await new Promise(resolve => setTimeout(resolve, 10));
      await service.analyze('patient-456', 'other.jpg');
      await service.findByPatientId('patient-123');

      const found = await service.findOne(analysisId);

      expect(found?.id).toBe(analysis.id);
      expect(found?.patientId).toBe(analysis.patientId);
      expect(found?.imageUrl).toBe(analysis.imageUrl);
    });
  });
});
