"use strict";

function AddMouseEventListener(aBrowser) {
  return SpecialPowers.spawn(aBrowser, [], () => {
    content.catchedEvents = [];
    let listener = function(aEvent) {
      content.catchedEvents.push(aEvent.type);
    };

    let target = content.document.querySelector("p");
    target.onmouseenter = listener;
    target.onmouseleave = listener;
  });
}

function clearMouseEventListenerAndCheck(aBrowser, aExpectedEvents) {
  return SpecialPowers.spawn(aBrowser, [aExpectedEvents], events => {
    let target = content.document.querySelector("p");
    target.onmouseenter = null;
    target.onmouseleave = null;

    Assert.deepEqual(content.catchedEvents, events);
  });
}

add_task(async function testSwitchTabs() {
  const tabFirst = await BrowserTestUtils.openNewForegroundTab(
    gBrowser,
    "http://example.com/browser/browser/base/content/test/general/dummy_page.html",
    true
  );

  info("Initial mouse move");
  await EventUtils.synthesizeAndWaitNativeMouseMove(
    tabFirst.linkedBrowser,
    10,
    10
  );

  info("Open and move to a new tab");
  await AddMouseEventListener(tabFirst.linkedBrowser);
  const tabSecond = await BrowserTestUtils.openNewForegroundTab(
    gBrowser,
    "http://example.com/browser/browser/base/content/test/general/dummy_page.html"
  );
  // Wait a bit to see if there is any unexpected mouse event.
  await TestUtils.waitForTick();
  await clearMouseEventListenerAndCheck(tabFirst.linkedBrowser, ["mouseleave"]);

  info("switch back to the previous tab");
  await AddMouseEventListener(tabFirst.linkedBrowser);
  await AddMouseEventListener(tabSecond.linkedBrowser);
  await BrowserTestUtils.switchTab(gBrowser, tabFirst);
  // Wait a bit to see if there is any unexpected mouse event.
  await TestUtils.waitForTick();
  await clearMouseEventListenerAndCheck(tabFirst.linkedBrowser, ["mouseenter"]);
  await clearMouseEventListenerAndCheck(tabSecond.linkedBrowser, [
    "mouseleave",
  ]);

  info("Close tabs");
  BrowserTestUtils.removeTab(tabFirst);
  BrowserTestUtils.removeTab(tabSecond);
});
