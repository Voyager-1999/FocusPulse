<template>
  <div class="modal fade" id="SortsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">分类管理</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">名称</th>
                <th scope="col">颜色</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sort in sorts" :key="sort.name">
                <td>{{ sort.name }}</td>
                <td>
                  <span class="color-dot" :style="{ backgroundColor: sort.color }"></span>
                  <span class="color-code">{{ sort.color }}</span>
                </td>
                <td>
                  <i
                    v-if="sort.name !== '不分类'"
                    class="bi-trash mx-2"
                    title="删除"
                    @click="removeSort(sort.name)"
                  ></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 分类已删除toast -->
    <div id="sortRemovedToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; bottom: 32px; right: 32px; z-index: 9999;">
      <div class="toast-body">
        分类已删除
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSortsStore } from '../store/sorts.store'
import { Modal, Toast } from 'bootstrap'
import { ref, computed, onMounted } from 'vue'

const sortsStore = useSortsStore()
const sorts = computed(() => sortsStore.sorts)

function removeSort(name) {
  sortsStore.deleteSort(name)
  // 显示toast
  const toastElement = document.getElementById('sortRemovedToast')
  if (toastElement) {
    const toast = new Toast(toastElement)
    toast.show()
  }
}

onMounted(() => {
  // 可选：确保modal初始化
  const modalElement = document.getElementById('SortsModal');
  if (!modalElement) {
    console.error('SortsModal element not found');
  }
})
</script>

<style scoped lang="scss">
.color-dot {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  margin-right: 8px;
  vertical-align: middle;
}
.color-code {
  font-size: 12px;
  color: #888;
}
.bi-trash {
  cursor: pointer;
  color: #f56c6c;
  &:hover {
    color: #ff0000;
  }
}
</style> 