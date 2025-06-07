<template>
  <div class="modal fade" id="RecurrentEventsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="d-flex">
            <h5 class="modal-title">重复任务</h5>

            <select
              class="form-select re-input w-auto mx-3"
              aria-label="Default select example"
              v-model="repeatingType"
            >
              <option value="all">显示全部</option>
              <option value="3">每天</option>
              <option value="2">每周</option>
              <option value="4">工作日</option>
              <option value="5">自定义工作日</option>
              <option value="1">每月</option>
              <option value="6">每月指定日期</option>
              <option value="0">每年</option>
            </select>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th class="recurrent-heading" scope="col">任务</th>
                <th class="recurrent-heading" scope="col">频率</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in recurringTasks" :key="task.id">
                <td class="reccurent-items">{{ task.data.text }}</td>
                <td class="recurring-freq">{{ frecuency(task) }}</td>
                <td>
                  <i
                    class="bi-trash mx-2"
                    title="删除"
                    @click="removeRecurringTask(task.id)"
                    data-bs-dismiss="modal"
                  ></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <comfirm-modal
    :id="'removeReModal'"
    title="删除重复任务"
    text="确定要删除这个重复任务吗？"
    :ico="'bi-x-circle'"
    okText="删除"
    @on-ok="removeRepeatingTaskComfirmed"
    @on-cancel="removeRepeatingTaskCanceled"
  ></comfirm-modal>
  <!-- 确保该元素存在 -->
  <div id="recurrentTaskRemoved" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-body">
      重复任务已删除
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Toast, Modal } from "bootstrap"
import repeatingEventHelper from "../utils/repeatingEventHelper.js"
import repeatingEventRepository from "../repositories/repeatingEventRepository"
import comfirmModal from "./comfirmModal.vue"
import dayjs from "dayjs"
import { useRepeatingEventStore } from '../store/repeatingEvent.store'
import { useRepeatingEventDateCacheStore } from '../store/repeatingEventDateCache.store'
import { useConfigStore } from '../store/config.store'

const repeatingEventStore = useRepeatingEventStore()
const repeatingEventDateCacheStore = useRepeatingEventDateCacheStore()
const configStore = useConfigStore()

const index = ref(0)
const idToRemove = ref(null)
const repeatingType = ref("all")

const language = computed(() => configStore.language)

const recurringTasks = computed(() => {
  let tasks = []
  for (const key in repeatingEventStore.repeatingEventList) {
    if (repeatingType.value === "all" || repeatingType.value === repeatingEventStore.repeatingEventList[key].type) {
      tasks.push(repeatingEventStore.repeatingEventList[key])
    }
  }
  return tasks
})

function frecuency(task) {
  switch (task.type) {
    case "0":
      return "每年 / " + dayjs(task.start_date).locale(language.value).format("MMM Do")
    case "1":
      return "每月 / " + dayjs(task.start_date).locale(language.value).format("Do")
    case "2":
      return "每周 / " + dayjs(task.start_date).locale(language.value).format("dddd")
    case "3":
      return "每天"
    case "4":
      return "工作日"
    case "5":
      return "自定义工作日"
    case "6":
      return "每月指定日期 / " + task.repeating_rule.split("BYMONTHDAY=")[1]
  }
}

function removeRecurringTask(id) {
  idToRemove.value = id
  const modalElement = document.getElementById("removeReModal")
  if (modalElement) {
    const modal = new Modal(modalElement, { backdrop: "static" })
    modal.show()
  }
}

function removeRepeatingTaskComfirmed() {
  repeatingEventRepository.remove(idToRemove.value)
  repeatingEventStore.removeRepeatingEvent(idToRemove.value)

  repeatingEventStore.selectedDates.forEach((date) => {
    repeatingEventHelper.removeGeneratedRepeatingEvents(date)
  })

  repeatingEventDateCacheStore.resetRepeatingEventDateCache()
  repeatingEventDateCacheStore.loadRepeatingEventDateCache(repeatingEventStore.repeatingEventList)

  const modalElement = document.getElementById("RecurrentEventsModal")
  if (modalElement) {
    const modal = new Modal(modalElement)
    modal.show()
  }
  const toastElement = document.getElementById("recurrentTaskRemoved")
  if (toastElement) {
    const toast = new Toast(toastElement)
    toast.show()
  }
}

function removeRepeatingTaskCanceled() {
  const modalElement = document.getElementById("RecurrentEventsModal")
  if (modalElement) {
    const modal = new Modal(modalElement)
    modal.show()
  }
}

function showModal() {
  const modalElement = document.getElementById('RecurrentEventsModal');
  if (modalElement) {
    const modal = new Modal(modalElement, { backdrop: 'static' });
    modal.show();
  }
}

onMounted(() => {
  const modalElement = document.getElementById('RecurrentEventsModal');
  if (modalElement) {
    const modal = new Modal(modalElement);
    console.log('Modal initialized:', modal);
  } else {
    console.error('Modal element not found');
  }
});
</script>

<style scoped lang="scss">
.modal-dialog {
  max-width: 800px;
}

.modal-body {
  height: 400px;
  overflow: auto;
  margin-bottom: 20px;
}

.table {
  --bs-table-hover-bg: #f4f4f4;
  color: #212529;
}

.dark-theme .table {
  --bs-table-bg: #21262d;
  --bs-table-striped-bg: #2c3034;
  --bs-table-striped-color: #fff;
  --bs-table-active-bg: #373b3e;
  --bs-table-active-color: #fff;
  --bs-table-hover-bg: #323539;
  --bs-table-hover-color: #fff;
  color: #fff;
  border-color: #373b3e;
}

.bi-trash {
  cursor: pointer;

  &:hover {
    color: black;
  }

  .dark-theme & {
    color: #babbbe;

    &:hover {
      color: white;
    }
  }
}

.recurrent-heading {
  .dark-theme & {
    color: rgb(222, 222, 222);
  }
}

.reccurent-items,
.recurring-freq {
  .dark-theme & {
    color: #babbbe;
  }
}
</style>
