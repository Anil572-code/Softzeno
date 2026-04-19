import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  const prismaMock = {
    inventory: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    stockMovement: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const service = new InventoryService(prismaMock as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds stock for purchase adjustments', async () => {
    prismaMock.inventory.upsert.mockResolvedValueOnce({ id: 'inv-1', quantity: 10 });
    prismaMock.inventory.update.mockResolvedValueOnce({ id: 'inv-1', quantity: 15 });
    prismaMock.stockMovement.create.mockResolvedValueOnce({ id: 'move-1' });
    prismaMock.$transaction.mockImplementation(async (actions: any[]) => Promise.all(actions));

    const result = await service.adjustStock('tenant-1', 'branch-1', 'user-1', {
      productId: 'product-1',
      quantity: 5,
      type: 'PURCHASE',
      notes: 'Restock',
    } as any);

    expect(prismaMock.inventory.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: { quantity: 15 },
    });
    expect(result.quantity).toBe(15);
  });

  it('deducts stock for sale adjustments', async () => {
    prismaMock.inventory.upsert.mockResolvedValueOnce({ id: 'inv-2', quantity: 8 });
    prismaMock.inventory.update.mockResolvedValueOnce({ id: 'inv-2', quantity: 5 });
    prismaMock.stockMovement.create.mockResolvedValueOnce({ id: 'move-2' });
    prismaMock.$transaction.mockImplementation(async (actions: any[]) => Promise.all(actions));

    const result = await service.adjustStock('tenant-1', 'branch-1', 'user-1', {
      productId: 'product-2',
      quantity: 3,
      type: 'SALE',
    } as any);

    expect(prismaMock.inventory.update).toHaveBeenCalledWith({
      where: { id: 'inv-2' },
      data: { quantity: 5 },
    });
    expect(result.quantity).toBe(5);
  });
});
