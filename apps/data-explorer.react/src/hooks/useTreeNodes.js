import { useState } from 'react'

function parser(data) {
  data = (Array.isArray(data) && data) || []
  
  return data.reduce((collection, [id, key, item]) => {
    const children = item?.length
      ? item.map((child) => ({ key: JSON.stringify([key, child]), label: child}))
      : []

    return [...collection, { key: JSON.stringify({id, label: key}), label: key, children: children }]
  }, [])
}

export default function useTreeNodes(initialValue) {
  const [treeNodes, setTreeNodes] = useState(() => {
    return parser(
      initialValue instanceof Function ? initialValue() : initialValue
    )
  })

  const setTreeNodesProxy = (data) => {
    setTreeNodes(parser(data))
  }

  return [treeNodes, setTreeNodesProxy]
}
