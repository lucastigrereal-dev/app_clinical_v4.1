import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProtocolsController } from './protocols.controller';
import { ProtocolsService, MedicalProtocol } from './protocols.service';
import { ProtocolResponseDto } from './dto/protocol-response.dto';

const mockMedicalProtocol: MedicalProtocol = {
  procedureName: 'Lipoaspiração',
  procedureId: 'lipoaspiracao',
  category: 'aesthetic',
  duration: '6_months',
  totalDays: 180,
  totalMilestones: 82,
  metadata: {
    averageRecoveryTime: '2_months',
    riskLevel: 'medium',
    patientSatisfaction: 0.94,
    complicationRate: 0.08,
    tags: ['cirurgia', 'corpo', 'estética'],
    searchKeywords: ['lipo', 'gordura', 'shape', 'corpo'],
  },
  milestones: [
    {
      id: 'lipoaspiracao_d0_morning',
      dayOffset: 0,
      timeOfDay: 'morning',
      title: 'D+0: Primeiro Dia Pós-Lipo',
      message: 'Bom dia! Hoje é o primeiro dia.',
      priority: 'high',
      instructions: ['Use a cinta compressiva 24h'],
      warnings: ['Hematomas e inchaço são normais'],
      tips: ['Mantenha-se hidratada'],
    },
    {
      id: 'lipoaspiracao_d7_morning',
      dayOffset: 7,
      timeOfDay: 'morning',
      title: 'D+7: Uma Semana',
      message: 'Parabéns! Uma semana completa!',
      priority: 'medium',
      instructions: ['Continue usando a cinta'],
      warnings: ['Inchaço ainda presente'],
      tips: ['Fotografe seu progresso'],
    },
  ],
};

describe('ProtocolsController', () => {
  let controller: ProtocolsController;
  let service: ProtocolsService;

  const mockProtocolsService = {
    findAll: jest.fn(),
    findByProcedure: jest.fn(),
    findByType: jest.fn(),
    getTimeline: jest.fn(),
    getMedicalProcedures: jest.fn(),
    getMedicalProtocolByProcedure: jest.fn(),
    getMilestoneByDay: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProtocolsController],
      providers: [
        {
          provide: ProtocolsService,
          useValue: mockProtocolsService,
        },
      ],
    }).compile();

    controller = module.get<ProtocolsController>(ProtocolsController);
    service = module.get<ProtocolsService>(ProtocolsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // Module Definition
  // ==========================================
  describe('Module Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have ProtocolsService injected', () => {
      expect(service).toBeDefined();
    });
  });

  // ==========================================
  // GET /protocols
  // ==========================================
  describe('findAll', () => {
    it('should return paginated protocols with DTO transformation', async () => {
      const mockProtocols = [
        { id: 1, procedure_name: 'Lipoaspiração', type: 'post-operative' },
        { id: 2, procedure_name: 'Rinoplastia', type: 'post-operative' },
      ];
      mockProtocolsService.findAll.mockResolvedValue(mockProtocols);

      const result = await controller.findAll({ limit: 20, page: 1 });

      expect(service.findAll).toHaveBeenCalledWith({ limit: 20, page: 1 });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ProtocolResponseDto);
    });

    it('should pass query parameters to service', async () => {
      mockProtocolsService.findAll.mockResolvedValue([]);

      await controller.findAll({ limit: 10, page: 3 });

      expect(service.findAll).toHaveBeenCalledWith({ limit: 10, page: 3 });
    });

    it('should handle empty results', async () => {
      mockProtocolsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // GET /protocols/type/:type
  // ==========================================
  describe('findByType', () => {
    it('should return protocols filtered by type', async () => {
      const mockProtocols = [
        { id: 1, procedure_name: 'Lipoaspiração', type: 'pre-operative' },
      ];
      mockProtocolsService.findByType.mockResolvedValue(mockProtocols);

      const result = await controller.findByType('pre-operative');

      expect(service.findByType).toHaveBeenCalledWith('pre-operative');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProtocolResponseDto);
    });

    it('should handle type with special characters', async () => {
      mockProtocolsService.findByType.mockResolvedValue([]);

      await controller.findByType('post-operative-care');

      expect(service.findByType).toHaveBeenCalledWith('post-operative-care');
    });
  });

  // ==========================================
  // GET /protocols/procedure/:name
  // ==========================================
  describe('findByProcedure', () => {
    it('should return protocols for specific procedure', async () => {
      const mockProtocols = [
        { id: 1, procedure_name: 'Lipoaspiração', type: 'post-operative' },
      ];
      mockProtocolsService.findByProcedure.mockResolvedValue(mockProtocols);

      const result = await controller.findByProcedure('Lipoaspiração');

      expect(service.findByProcedure).toHaveBeenCalledWith('Lipoaspiração');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProtocolResponseDto);
    });

    it('should decode URI encoded procedure name', async () => {
      mockProtocolsService.findByProcedure.mockResolvedValue([]);

      await controller.findByProcedure(encodeURIComponent('Lipoaspiração'));

      expect(service.findByProcedure).toHaveBeenCalledWith('Lipoaspiração');
    });

    it('should handle special characters in procedure name', async () => {
      mockProtocolsService.findByProcedure.mockResolvedValue([]);

      await controller.findByProcedure(encodeURIComponent('Lipo & Abdômen'));

      expect(service.findByProcedure).toHaveBeenCalledWith('Lipo & Abdômen');
    });
  });

  // ==========================================
  // GET /protocols/procedure/:name/timeline
  // ==========================================
  describe('getTimeline', () => {
    it('should return timeline for procedure', async () => {
      const mockTimeline = {
        procedure: 'Lipoaspiração',
        timeline: [
          { day: 0, task: 'Cirurgia' },
          { day: 7, task: 'Retorno' },
        ],
      };
      mockProtocolsService.getTimeline.mockResolvedValue(mockTimeline);

      const result = await controller.getTimeline('Lipoaspiração');

      expect(service.getTimeline).toHaveBeenCalledWith('Lipoaspiração');
      expect(result).toEqual(mockTimeline);
      expect(result.timeline).toHaveLength(2);
    });

    it('should decode URI encoded procedure name', async () => {
      mockProtocolsService.getTimeline.mockResolvedValue({
        procedure: 'Lipoaspiração',
        timeline: [],
      });

      await controller.getTimeline(encodeURIComponent('Lipoaspiração'));

      expect(service.getTimeline).toHaveBeenCalledWith('Lipoaspiração');
    });
  });

  // ==========================================
  // GET /protocols/medical
  // ==========================================
  describe('getMedicalProcedures', () => {
    it('should return list of all medical procedures', () => {
      const mockProcedures = [
        {
          name: 'Lipoaspiração',
          id: 'lipoaspiracao',
          category: 'aesthetic',
          totalMilestones: 82,
          totalDays: 180,
          metadata: mockMedicalProtocol.metadata,
        },
        {
          name: 'Rinoplastia',
          id: 'rinoplastia',
          category: 'aesthetic',
          totalMilestones: 52,
          totalDays: 365,
          metadata: {
            averageRecoveryTime: '6_months',
            riskLevel: 'medium',
            patientSatisfaction: 0.92,
            complicationRate: 0.12,
            tags: ['cirurgia', 'face', 'nariz'],
            searchKeywords: ['rinoplastia', 'nariz'],
          },
        },
      ];
      mockProtocolsService.getMedicalProcedures.mockReturnValue(mockProcedures);

      const result = controller.getMedicalProcedures();

      expect(service.getMedicalProcedures).toHaveBeenCalled();
      expect(result).toEqual(mockProcedures);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Lipoaspiração');
      expect(result[1].name).toBe('Rinoplastia');
    });

    it('should return empty array when no procedures available', () => {
      mockProtocolsService.getMedicalProcedures.mockReturnValue([]);

      const result = controller.getMedicalProcedures();

      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // GET /protocols/medical/:procedureName
  // ==========================================
  describe('getMedicalProtocol', () => {
    it('should return complete medical protocol', () => {
      mockProtocolsService.getMedicalProtocolByProcedure.mockReturnValue(
        mockMedicalProtocol
      );

      const result = controller.getMedicalProtocol('Lipoaspiração');

      expect(service.getMedicalProtocolByProcedure).toHaveBeenCalledWith('Lipoaspiração');
      expect(result).toEqual(mockMedicalProtocol);
      expect(result.procedureName).toBe('Lipoaspiração');
      expect(result.totalMilestones).toBe(82);
      expect(result.milestones).toHaveLength(2);
    });

    it('should decode URI encoded procedure name', () => {
      mockProtocolsService.getMedicalProtocolByProcedure.mockReturnValue(
        mockMedicalProtocol
      );

      controller.getMedicalProtocol(encodeURIComponent('Lipoaspiração'));

      expect(service.getMedicalProtocolByProcedure).toHaveBeenCalledWith('Lipoaspiração');
    });

    it('should throw NotFoundException when protocol not found', () => {
      mockProtocolsService.getMedicalProtocolByProcedure.mockImplementation(() => {
        throw new NotFoundException('Medical protocol not found for: NonExistent');
      });

      expect(() => {
        controller.getMedicalProtocol('NonExistent');
      }).toThrow(NotFoundException);
    });

    it('should work with procedure ID', () => {
      mockProtocolsService.getMedicalProtocolByProcedure.mockReturnValue(
        mockMedicalProtocol
      );

      const result = controller.getMedicalProtocol('lipoaspiracao');

      expect(service.getMedicalProtocolByProcedure).toHaveBeenCalledWith('lipoaspiracao');
      expect(result.procedureId).toBe('lipoaspiracao');
    });
  });

  // ==========================================
  // GET /protocols/medical/:procedureName/day/:day
  // ==========================================
  describe('getMilestoneByDay', () => {
    it('should return milestones for specific day', () => {
      const mockMilestones = [
        {
          id: 'lipoaspiracao_d0_morning',
          dayOffset: 0,
          timeOfDay: 'morning',
          title: 'D+0: Primeiro Dia',
          message: 'Bom dia!',
          priority: 'high',
        },
      ];
      mockProtocolsService.getMilestoneByDay.mockReturnValue(mockMilestones);

      const result = controller.getMilestoneByDay('Lipoaspiração', '0');

      expect(service.getMilestoneByDay).toHaveBeenCalledWith('Lipoaspiração', 0);
      expect(result).toEqual(mockMilestones);
      expect(result).toHaveLength(1);
      expect(result[0].dayOffset).toBe(0);
    });

    it('should parse day parameter to integer', () => {
      mockProtocolsService.getMilestoneByDay.mockReturnValue([]);

      controller.getMilestoneByDay('Lipoaspiração', '7');

      expect(service.getMilestoneByDay).toHaveBeenCalledWith('Lipoaspiração', 7);
    });

    it('should decode URI encoded procedure name', () => {
      mockProtocolsService.getMilestoneByDay.mockReturnValue([]);

      controller.getMilestoneByDay(encodeURIComponent('Lipoaspiração'), '7');

      expect(service.getMilestoneByDay).toHaveBeenCalledWith('Lipoaspiração', 7);
    });

    it('should throw NotFoundException when no milestone found', () => {
      mockProtocolsService.getMilestoneByDay.mockImplementation(() => {
        throw new NotFoundException('No milestone found for day 999');
      });

      expect(() => {
        controller.getMilestoneByDay('Lipoaspiração', '999');
      }).toThrow(NotFoundException);
    });

    it('should handle multiple milestones for same day', () => {
      const mockMilestones = [
        {
          id: 'lipoaspiracao_d7_morning',
          dayOffset: 7,
          timeOfDay: 'morning',
          title: 'D+7: Manhã',
        },
        {
          id: 'lipoaspiracao_d7_evening',
          dayOffset: 7,
          timeOfDay: 'evening',
          title: 'D+7: Noite',
        },
      ];
      mockProtocolsService.getMilestoneByDay.mockReturnValue(mockMilestones);

      const result = controller.getMilestoneByDay('Lipoaspiração', '7');

      expect(result).toHaveLength(2);
      expect(result[0].timeOfDay).toBe('morning');
      expect(result[1].timeOfDay).toBe('evening');
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle special characters in procedure name', () => {
      mockProtocolsService.getMedicalProtocolByProcedure.mockReturnValue(
        mockMedicalProtocol
      );

      const specialName = 'Lipo & Abdômen 360°';
      controller.getMedicalProtocol(encodeURIComponent(specialName));

      expect(service.getMedicalProtocolByProcedure).toHaveBeenCalledWith(specialName);
    });

    it('should handle non-numeric day parameter gracefully', () => {
      mockProtocolsService.getMilestoneByDay.mockReturnValue([]);

      controller.getMilestoneByDay('Lipoaspiração', 'abc');

      // parseInt('abc') returns NaN
      expect(service.getMilestoneByDay).toHaveBeenCalledWith('Lipoaspiração', NaN);
    });

    it('should handle negative day parameter', () => {
      mockProtocolsService.getMilestoneByDay.mockImplementation(() => {
        throw new NotFoundException('No milestone found for day -1');
      });

      expect(() => {
        controller.getMilestoneByDay('Lipoaspiração', '-1');
      }).toThrow(NotFoundException);
    });

    it('should handle empty string procedure name', () => {
      mockProtocolsService.getMedicalProtocolByProcedure.mockImplementation(() => {
        throw new NotFoundException('Medical protocol not found for: ');
      });

      expect(() => {
        controller.getMedicalProtocol('');
      }).toThrow(NotFoundException);
    });
  });

  // ==========================================
  // Integration Scenarios
  // ==========================================
  describe('Integration Scenarios', () => {
    it('should handle complete workflow: list -> get protocol -> get milestone', () => {
      // Step 1: List all procedures
      mockProtocolsService.getMedicalProcedures.mockReturnValue([
        {
          name: 'Lipoaspiração',
          id: 'lipoaspiracao',
          category: 'aesthetic',
          totalMilestones: 82,
          totalDays: 180,
          metadata: mockMedicalProtocol.metadata,
        },
      ]);
      const procedures = controller.getMedicalProcedures();
      expect(procedures).toHaveLength(1);

      // Step 2: Get full protocol
      mockProtocolsService.getMedicalProtocolByProcedure.mockReturnValue(
        mockMedicalProtocol
      );
      const protocol = controller.getMedicalProtocol('lipoaspiracao');
      expect(protocol.totalMilestones).toBe(82);

      // Step 3: Get specific day milestone
      mockProtocolsService.getMilestoneByDay.mockReturnValue([
        mockMedicalProtocol.milestones[0],
      ]);
      const milestone = controller.getMilestoneByDay('lipoaspiracao', '0');
      expect(milestone[0].dayOffset).toBe(0);
    });

    it('should handle URL encoded inputs correctly', () => {
      const procedureName = 'Lipoaspiração & Abdômen';
      const encodedName = encodeURIComponent(procedureName);

      mockProtocolsService.getMedicalProtocolByProcedure.mockReturnValue(
        mockMedicalProtocol
      );

      controller.getMedicalProtocol(encodedName);

      expect(service.getMedicalProtocolByProcedure).toHaveBeenCalledWith(procedureName);
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================
  describe('Error Handling', () => {
    it('should propagate service errors', async () => {
      mockProtocolsService.findAll.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(controller.findAll({})).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should propagate NotFoundException from service', () => {
      mockProtocolsService.getMedicalProtocolByProcedure.mockImplementation(() => {
        throw new NotFoundException('Protocol not found');
      });

      expect(() => {
        controller.getMedicalProtocol('NonExistent');
      }).toThrow(NotFoundException);
    });
  });
});
