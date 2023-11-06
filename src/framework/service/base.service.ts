import { DataSource, QueryRunner, Repository } from 'typeorm';
import { BaseModel } from '../model/base.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { NoSuchEntityException } from '../exception/no-such-entity.exception';

export abstract class BaseService<T extends BaseModel> {
  protected repo: Repository<T>;

  protected constructor(
    repo: Repository<T>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,

    protected readonly idFieldName = 'entityId',
    protected readonly eventPrefix = 'service',
  ) {
    this.repo = repo;
  }

  async getById(id: number): Promise<T> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-by-id`,
      { id },
      async () => {
        const items = await this.repo.findOne({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          where: {
            [this.idFieldName]: id,
          },
        });
        if (!items) {
          throw new NoSuchEntityException();
        }
        return items;
      },
    );
  }

  async getList(criteria?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-list`,
      { criteria },
      () => this.repo.findAndCount(criteria),
    );
  }

  async getOne(
    criteria?: FindManyOptions<T>,
    throwErrorOnEmpty = true,
  ): Promise<T> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-one`,
      { criteria },
      async () => {
        const entity = await this.repo.findOne(criteria);
        if (!entity && throwErrorOnEmpty) {
          throw new NoSuchEntityException();
        }
        return entity;
      },
    );
  }

  async save(entity: T): Promise<T> {
    return this.wrapToTransactionContainer(
      `${this.eventPrefix}.save`,
      async (queryRunner) =>
        queryRunner.manager.save<T>(entity, {
          reload: true,
          transaction: false,
        }),
      { entity },
    );
  }

  async update(id: number, entity: Partial<T>): Promise<T> {
    const entityFromDb = await this.getById(id);
    Object.assign(entityFromDb, entity);
    return this.save(entityFromDb);
  }

  async delete(entity: T) {
    return this.wrapToTransactionContainer(
      `${this.eventPrefix}.delete`,
      async (queryRunner) => queryRunner.manager.remove(entity),
      { entity },
    );
  }

  protected async wrapToTransactionContainer(
    event: string,
    actionFn: (queryRunner: QueryRunner) => Promise<any>,
    eventVariables?: object,
  ) {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const result = await this.wrapToEventContainer(
        event,
        { queryRunner, ...eventVariables },
        async () => actionFn(queryRunner),
      );

      await this.wrapToEventContainer(
        `${event}.commit`,
        { queryRunner, ...eventVariables },
        async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
        },
      );
      return result;
    } catch (e) {
      queryRunner.isTransactionActive &&
        (await queryRunner.rollbackTransaction());
      await queryRunner.release();
      throw e;
    }
  }

  protected async wrapToEventContainer(
    eventIdPrefix: string,
    variables: object,
    actionFunction: () => Promise<any>,
  ) {
    await this.eventEmitter.emitAsync(`${eventIdPrefix}.before`, {
      ...variables,
    });

    // Subscribe for the event after
    return actionFunction().then(async (result) => {
      await this.eventEmitter.emitAsync(`${eventIdPrefix}.after`, {
        ...variables,
        result,
      });
      return result;
    });
  }

  async saveBulk(list: T[]) {
    return this.wrapToTransactionContainer(
      `${this.eventPrefix}.save-bulk`,
      async (queryRunner) => queryRunner.manager.save(list),
      { list },
    );
  }
}
