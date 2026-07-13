import { TestBed } from '@angular/core/testing';

import { PerfilesService } from './perfiles.service';

describe('PerfilesService', () => {
  let service: PerfilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
