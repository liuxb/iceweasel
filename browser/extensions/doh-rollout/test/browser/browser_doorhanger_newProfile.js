"use strict";

add_task(setup);

add_task(async function testDoorhanger() {
  Preferences.reset(prefs.PROFILE_CREATION_THRESHOLD_PREF);
  // Set up a passing environment and enable DoH.
  setPassingHeuristics();
  let prefPromise = TestUtils.waitForPrefChange(prefs.DOH_SELF_ENABLED_PREF);
  let doorhangerPrefPromise = TestUtils.waitForPrefChange(
    prefs.DOH_DOORHANGER_SHOWN_PREF
  );
  Preferences.set(prefs.DOH_ENABLED_PREF, true);

  await prefPromise;
  is(Preferences.get(prefs.DOH_SELF_ENABLED_PREF), true, "Breadcrumb saved.");
  is(
    Preferences.get(prefs.DOH_TRR_SELECT_URI_PREF),
    "dummyTRR",
    "TRR selection complete."
  );
  await checkTRRSelectionTelemetry();

  await doorhangerPrefPromise;
  is(
    Preferences.get(prefs.DOH_DOORHANGER_SHOWN_PREF),
    true,
    "Doorhanger shown pref saved."
  );
  is(
    Preferences.get(prefs.DOH_DOORHANGER_USER_DECISION_PREF),
    "NewProfile",
    "Doorhanger decision saved."
  );
  is(
    Preferences.get(prefs.DOH_SELF_ENABLED_PREF),
    true,
    "Breadcrumb not cleared."
  );
});
