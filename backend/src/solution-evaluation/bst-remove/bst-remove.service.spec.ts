import { Test, TestingModule } from '@nestjs/testing';
import { BstRemoveService } from './bst-remove.service';

describe('BstRemoveService', () => {
  let service: BstRemoveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BstRemoveService],
    }).compile();

    service = module.get<BstRemoveService>(BstRemoveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
