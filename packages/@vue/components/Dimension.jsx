import { defineComponent, ref } from 'vue'
import './dimension.css'

const Dimension2 = defineComponent({
  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const isOpen = ref(false)
    const filterText = ref('')
    const isAllFilters = ref(true)

    function matchesFilter(filters) {
      return filters
        .toLowerCase()
        .trim()
        .includes(filterText.value.toLowerCase().trim())
    }

    function toggleValue(value) {
      if (value in props.valueFilter) {
        props.removeValuesFromFilter(props.name, [value])
      } else {
        props.addValuesToFilter(props.name, [value])
      }
    }

    function selectOnly(event, value) {
      event.stopPropagation()
      props.setAllValuesInFilter(
        props.name,
        Object.keys(props?.attrValues).filter(item => item !== value)
      )
    }

    function toggleFilterPane() {
      isOpen.value = !isOpen.value
    }

    function createFilterPane() {
      // const isMenuLimit = Object.keys(props?.attrValues).length < props.menuLimit

      // const shown = Object.keys(props?.attrValues)
      //               .filter(matchesFilter.bind(this))
      //               .sort(props.sorter)

      return (
        <div class="dimension__dropdown">
          <header class="dimension__dropdown-header">
            <button
              class="dimension__dropdown-close"
              onClick={() => isOpen.value = false}
            >&#10799;</button>
            
            <h4>{props.name}</h4>
          </header>

          {/* {isMenuLimit || <p>(too many values to show)</p>}

          {isMenuLimit && (
            <div class="dimension__filters-toolbar">
              <input
                type="text"
                class="control__filters-search"
                placeholder="Filter values"
                value={filterText}
                onChange={event => filterText.value = event.target.value}
              />

              <label class="control__filters-all-toggle">
                <input
                  type="checkbox"
                  ref={($input) => { if ($input) $input.indeterminate = props.isIndeterminate }}
                  checked={isAllFilters}
                  onChange={(event) => isAllFilters.value = event.target.checked}
                />
                <span>Select All</span>
              </label>
            </div>
          )}

          {isMenuLimit && (
            <ul class="filters__list">
              {shown.map(item => (
                <li
                  class={`filters__list-item ${item in props.valueFilter ? '' : 'filters__list-item--selected'}`}
                  key={item}
                  onClick={() => toggleValue(item)}
                >
                  <div class="pivot__filter">
                    <a class="filter__toggle-only" onClick={event => selectOnly(event, item)}>
                      only
                    </a>

                    {item === '' ? <em>null</em> : item}
                  </div>
                </li>
              ))}
            </ul>
          )} */}
        </div>
      )
    }

    // const filteredClass = Object.keys(props.valueFilter).length !== 0
    //                       ? 'pivot__dimension--filter'
    //                       : ''

    return () => (
      <li class="dimension__list-item sortable">
        <div class="pivot__dimension">
          <span>{props.item.name}</span>
          <button
            class="dimension__dropdown-toggle"
            onClick={toggleFilterPane.bind(this)}
            >&#9662;</button>
        </div>
        
        {isOpen.value ? createFilterPane() : null}
      </li>
    )
  }
})

export default Dimension2
