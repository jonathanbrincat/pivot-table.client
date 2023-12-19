import { useState } from 'react'

function parser(data) {
  data = (Array.isArray(data) && data) || []
  
  return data.reduce((collection, [key, item]) => {
    const children = item?.length
      ? item.map((child) => ({ key: JSON.stringify([key, child]), label: child, parent: key, parentId: key }))
      : []

    return [...collection, { key: key, label: key, children: children }]
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
