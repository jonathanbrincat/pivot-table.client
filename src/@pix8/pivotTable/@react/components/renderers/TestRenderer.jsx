import PivotData from '../../../@core/js/PivotData'

function makeRenderer(
  config = {}
) {

  function TestRenderer(props) {
    const pivotData = new PivotData(props)

    return (
      <div>
        <h1 className="text-4xl">Test wtf</h1>
        {
          (config.mode === 'FOO') && (
            <h2>hello foo test</h2>
          )
        }

        {
          (config.mode === 'BAR') && (
            <h2>hello bar test</h2>
          )
        }
      </div>
    )
  }

  return TestRenderer
}

export default {
  // Test1: TestRenderer,
  Test2: makeRenderer(),
  Test3: makeRenderer({ mode: 'FOO' }),
  Test4: makeRenderer({ mode: 'BAR'}),
  // Test5: <TestRenderer test={'FOO'} />,
}