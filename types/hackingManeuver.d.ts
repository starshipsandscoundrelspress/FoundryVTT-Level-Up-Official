import type { A5e } from '../src/config';

import { A5EHackingManeuverData } from '../src/dataModels/item/HackingMaenuverDataModel';

declare global {
  namespace foundry.data {
    interface DataModelDefinitions {
      "A5E.HackingManeuver": A5EHackingManeuverData.Schema;
    }
  }

  type A5EHackingManeuver = InstanceType<typeof A5EHackingManeuverData>;
}

export default something = {};
