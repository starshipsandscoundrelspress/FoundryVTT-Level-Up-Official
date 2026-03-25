<script>
    import { localize } from "#runtime/util/i18n";
    import { getContext, onDestroy } from "svelte";

    import updateDocumentDataFromField from "../../../utils/updateDocumentDataFromField";
    import usesRequired from "../../../utils/usesRequired";

    import CreateMenu from "../actorUtilityBar/CreateMenu.svelte";
    import Filter from "../actorUtilityBar/Filter.svelte";
    import ItemCategory from "../ItemCategory.svelte";
    import Search from "../actorUtilityBar/Search.svelte";
    import ShowDescription from "../actorUtilityBar/ShowDescription.svelte";
    import Sort from "../actorUtilityBar/Sort.svelte";
    import TabFooter from "../TabFooter.svelte";
    import UtilityBar from "../actorUtilityBar/UtilityBar.svelte";

    const actor = getContext("actor");
    const { hackingManeuvers } = actor;
    const subTypes = CONFIG.A5E.hackingManeuverDieCosts;
    const reducerType = "hackingManeuvers";
    const openCompendium = game.a5e.utils.openCompendium;

    let showDescription = false;
    let showUses = usesRequired(hackingManeuvers);

    $: dieCost = $actor.system.attributes.dieCost;
    $: menuList = Object.entries(subTypes);

    const unsubscribe = hackingManeuvers.subscribe((_) => {
        showUses = usesRequired(hackingManeuvers);
    });

    onDestroy(() => {
        unsubscribe();
    });

    async function deductDiceFromPool(diceCost) {
        if (dieCost.current < diceCost) {
            ui.notifications.warn(
                localize("A5E.hackingManeuvers.error.insufficientDice"),
            );
            return false;
        }

        const newCurrent = Math.max(0, dieCost.current - diceCost);
        updateDocumentDataFromField(
            $actor,
            "system.attributes.dieCost.current",
            newCurrent,
        );

        await updateDocumentDataFromField(
            $actor,
            "system.attributes.dieCost.current",
            newCurrent,
        );

        ui.notifications.info(
            `${localize("A5E.hackingManeuvers.diceDeducted")}: ${diceCost} (Remaining: ${newCurrent})`,
        );

        return true;
    }

    async function rollDicePool() {
        if (dieCost.current <= 0) {
            ui.notifications.warn(localize("A5E.hackingManeuvers.error.noDiceToRoll"));
            return;
        }

        const rolls = [];
        for (let i = 0; i < dieCost.current; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }

        const sixes = rolls.filter((r) => r === 6).length;
        const remaining = dieCost.current - sixes;

        const rollResults = rolls.join(", ");
        const messageContent = `
            <div class="a5e-hacking-pool-roll">
                 <p><strong>${localize("A5E.hackingManeuvers.diceRolled")}:</strong> ${rollResults}</p>
                 <p><strong>${localize("A5E.hackingManeuvers.sixes")}:</strong> ${sixes}</p>
                 <p><strong>${localize("A5E.hackingManeuvers.remaining")}:</strong> ${remaining}</p>
            </div>
        `;

        await ChatMessage.create({
            content: messageContent,
            speaker: ChatMessage.getSpeaker({ actor: $actor }),
        });

        await updateDocumentDataFromField(
            $actor,
            "system.attributes.dieCost.current",
            remaining,
        );

        ui.notifications.info(
            `${localize("A5E.hackingManeuvers.poolRolled")}: ${sixes} sixes removed. ${remaining} dice remaining.`,
        );
    }
</script>

{#if $actor.isOwner}
    <UtilityBar>
        <Search {reducerType} />
        <ShowDescription
            on:updateSelection={() => (showDescription = !showDescription)}
        />
        <Sort {reducerType} />
        <Filter {reducerType} />
        <CreateMenu {reducerType} {menuList} />

        <button
            class="a5e-import-from-compendium-button fa-solid fa-download"
            on:click={() => openCompendium($actor, "hackingManeuvers")}
            data-tooltip="Import Hacking Maneuvers from Compendium"
            data-tooltip-direction="UP"
        ></button>
    </UtilityBar>
{/if}

<section class="a5e-page-wrapper a5e-page-wrapper--item-list">
    {#each Object.entries($hackingManeuvers._dieCosts) as [label, items]}
        {#if items.length}
            <ItemCategory
                {label}
                {items}
                {showDescription}
                type="hackingManeuver"
                onItemClick={(item) => deductDiceFromPool(item.system.diceCost)}
            />
        {/if}
    {/each}
</section>

<TabFooter --padding-right="1rem">
    {#if $actor.type === "character"}
        <div class="u-flex u-align-center u-gap-md">
            <h3 class="u-mb-0 u-text-sm u-text-bold">
                {localize("A5E.exertion.pool")}
            </h3>

            <input
                class="a5e-footer-group__input"
                class:disable-pointer-events={!$actor.isOwner}
                type="number"
                name="system.attributes.dieCost.current"
                value={dieCost.current}
                placeholder="0"
                min="0"
                on:change={({ target }) =>
                    updateDocumentDataFromField(
                        $actor,
                        target.name,
                        Number(target.value),
                    )}
            />
            /
            <input
                class="a5e-footer-group__input"
                class:disable-pointer-events={!$actor.isOwner}
                type="number"
                name="system.attributes.dieCost.max"
                value={dieCost.max}
                placeholder="0"
                min="0"
                on:change={({ target }) =>
                    updateDocumentDataFromField(
                        $actor,
                        target.name,
                        Number(target.value),
                    )}
            />

            {#if dieCost.current > 0 && $actor.isOwner}
                <button
                    class="ate-roll-dice-pool-button fa-solid fa-dice-d6"
                    data-tooltip="A5e.hackingManeuvers.rollPoolTooltip"
                    data-tooltip-direction="UP"
                >
                    on:click={() => rollDicePool()}
                </button>
            {/if}
        </div>
    {/if}
</TabFooter>

<style lang="scss">
    .disable-pointer-events {
        pointer-events: none;
    }

    /*.recharge-button {
        flex-grow: 0;
        width: fit-content;
        padding: 0.25rem 0.5rem;
        margin: 0;
        margin-left: 0.5rem;
        background: #4a90e2;
        color: white;
        border: 1px solid #2a70c2;
        border-radius: 3px;
        font-size: 0.875rem;
        font-weight: 500;

        transition: var(--a5e-transition-standard);

        &:hover {
            color: #555;
            transform: scale(1.05);
        }

        &:active {
            background: #1a5fa2;
        }

        &:hover,
        &:focus {
            box-shadow: none;
        }

        &:disabled {
            background: #999;
            border-color: #666;
            cursor: not-allowed;
        }
    }*/
</style>
