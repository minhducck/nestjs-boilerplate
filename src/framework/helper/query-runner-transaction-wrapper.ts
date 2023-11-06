import { QueryRunner } from 'typeorm/query-runner/QueryRunner';
import { DataSource } from 'typeorm';

export async function queryRunnerTransactionWrapper<PromiseResult>(
  dataSource: DataSource,
  execution: (queryRunner: QueryRunner) => Promise<PromiseResult>,
) {
  const _queryRunner = dataSource.createQueryRunner();
  try {
    await _queryRunner.connect();
    await _queryRunner.startTransaction();
    const result = await execution(_queryRunner);
    await _queryRunner.commitTransaction();
    return result;
  } catch (e) {
    await _queryRunner.rollbackTransaction();
    throw e;
  } finally {
    !_queryRunner.isReleased && (await _queryRunner.release());
  }
}
