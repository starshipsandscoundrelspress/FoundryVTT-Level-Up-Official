import type { ActionsData, UsesData } from "./common";

import { A5EBaseItemData } from "./base";
import { actions, uses } from "./common";

const { fields } = foundry.data;

const schema = {
  diceCost: new fields.NumberField({
    required: true,
    initial: 0,
    integer: true,
    min: 0,
  }),
};

declare namespace A5EHackingManeuverData {
  type Schema = A5EBaseItemData.Schema & ActionsData & UsesData & typeof schema;
  type BaseData = A5EBaseItemData.BaseData;
  type DerivedData = A5EBaseItemData.DerivedData;
}

class A5EHackingManeuverData extends A5EBaseItemData<
  A5EHackingManeuverData.Schema,
  A5EHackingManeuverData.BaseData,
  A5EHackingManeuverData.DerivedData
> {
  /** @inheritDoc */
  static override defineSchema(): A5EHackingManeuverData.Schema {
    return {
      ...super.defineSchema(),
      ...actions(),
      ...uses(),
      ...schema,
    };
  }
}

export { A5EHackingManeuverData };
