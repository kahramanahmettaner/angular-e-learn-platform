import { Test, TestingModule } from '@nestjs/testing';
import { BstInsertService } from './bst-insert.service';

describe('BstInsertService', () => {
  let service: BstInsertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BstInsertService],
    }).compile();

    service = module.get<BstInsertService>(BstInsertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
