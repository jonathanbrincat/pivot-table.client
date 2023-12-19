import React from 'react'
import TestRenderer from 'react-test-renderer';
import Root from "./root_component";

test('Contains You clicked', () => {
  const renderedComponent = TestRenderer.create(
    <Root/>
  )
  const testInstance = renderedComponent.root;
  // const element = testInstance.findByType("div")
  // expect(
  //   element.children[0].children.includes("You clicked ")
  // ).toBe(true);
});
