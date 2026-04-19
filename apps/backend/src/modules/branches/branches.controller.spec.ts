import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('BranchesController (integration)', () => {
  let app: INestApplication;
  const branchesService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BranchesController],
      providers: [{ provide: BranchesService, useValue: branchesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res, next) => {
      req.user = { tenantId: 'tenant-1' };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /branches returns list', async () => {
    branchesService.findAll.mockResolvedValueOnce({
      data: [{ id: 'branch-1', name: 'Main', code: 'MAIN' }],
      meta: { totalCount: 1, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    });

    const response = await request(app.getHttpServer()).get('/branches');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(branchesService.findAll).toHaveBeenCalledWith('tenant-1', expect.any(Object));
  });

  it('POST /branches creates branch', async () => {
    branchesService.create.mockResolvedValueOnce({ id: 'branch-2', name: 'New Branch', code: 'NB' });

    const response = await request(app.getHttpServer())
      .post('/branches')
      .send({ name: 'New Branch', code: 'NB' });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('New Branch');
    expect(branchesService.create).toHaveBeenCalledWith('tenant-1', { name: 'New Branch', code: 'NB' });
  });
});
