import { computed, onMounted, reactive, ref } from 'vue'

import { Contact, getContactList, getMembers } from '../../api'
import { delaySync, textIncludes } from '../../utils/tools'

export const useSearchTable = () => {
  const query = reactive({
    keyword: '',
    pageIndex: 1,
    pageSize: 10
  })
  const initialSize = Math.min(query.pageSize * 2, 50)

  const allTableData = ref<Contact[]>([])

  const filterData = computed(() => {
    const { keyword } = query
    return allTableData.value.filter(item => {
      return (
        textIncludes(item.nickname, keyword) && item.wxid.includes('@chatroom')
      )
    })
  })

  const pageTotal = computed(() => filterData.value.length)
  const tableData = computed(() => {
    const { pageIndex, pageSize } = query
    const startIndex = (pageIndex - 1) * pageSize
    const endIndex = pageIndex * pageSize
    return filterData.value.slice(startIndex, endIndex)
  })

  const reset = () => {
    query.keyword = ''
    query.pageIndex = 1
    query.pageSize = 10
  }

  const fetchData = () => {
    getContactList().then(res => {
      allTableData.value = res.data
    })
  }

  const handleSearch = () => {
    query.pageIndex = 1
  }
  const handlePageSizeChange = (val: number) => {
    query.pageSize = val
  }
  const handlePageChange = (val: number) => {
    query.pageIndex = val
  }
  const handleRefreshData = (callback: () => void) => {
    reset()

    setTimeout(() => {
      fetchData()
      callback && callback()
    }, 2000)
  }

  onMounted(fetchData)

  const lazyFetchMembers = async (members: any[]) => {
    const offset = members.findIndex(item => typeof item === 'string')

    if (offset === -1) return

    let start = offset + 1

    while (start <= members.length - 1) {
      await delaySync()

      const memberIds = members.slice(start, start + initialSize)
      const memberData = await getMembers(memberIds)

      members.splice(start, initialSize, ...memberData)

      start += initialSize
    }
  }

  return {
    query,
    pageTotal,
    allTableData,
    tableData,
    filterData,

    initialSize,
    lazyFetchMembers,

    handleRefreshData,
    handleSearch,
    handlePageSizeChange,
    handlePageChange
  }
}
