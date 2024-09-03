import { TestBed } from '@angular/core/testing';

import { BinarySearchTreeService } from './binary-search-tree.service';

describe('BinarySearchTreeService', () => {
  let service: BinarySearchTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BinarySearchTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
