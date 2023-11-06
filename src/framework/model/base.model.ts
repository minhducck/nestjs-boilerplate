import { AfterLoad, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { cloneDeep } from 'lodash';

export class BaseModel<T = any> {
  #originData: object;

  constructor(init?: Partial<T>) {
    Object.assign(this, init ?? {});
  }
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @AfterLoad()
  protected originalObjectData() {
    this.#originData = cloneDeep(this);
  }

  getOriginData() {
    return this.#originData;
  }
}
