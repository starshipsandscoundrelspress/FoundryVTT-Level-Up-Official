import { DynMapReducer } from '#runtime/svelte/store/reducer';

export default class HackingManeuverMapReducer extends DynMapReducer {
  initialize() {
    this.filters.add((item) => item.type === 'hackingManeuver');
    this.sort.set((a, b) => a.sort - b.sort);

    this._dieCosts = {};
    Object.keys(CONFIG.A5E.hackingManeuverDieCosts).forEach((key) => {
      this._dieCosts[key] = this.derived.create(key);
    });

    Object.entries(this._dieCosts).forEach(([key, reducer]) => {
      reducer.filters.add((item) => parseInt(item.system.dieCost, 10) === Number(key));
    });
  }
}
