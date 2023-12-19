import React from 'react'
import TestRenderer from 'react-test-renderer';
import Root from "./index";

test('Contains You clicked', () => {
  const renderedComponent = TestRenderer.create(
    <Root/>
  )
  const testInstance = renderedComponent.root;
  const element = testInstance.findByType("div")
});
