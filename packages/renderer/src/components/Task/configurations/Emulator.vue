<script setup lang="ts">
import { NFormItem, NInput, NSelect, NSpace } from 'naive-ui'
import _ from 'lodash'
import router from '@/router'
import useDeviceStore from '@/store/devices'

const deviceStore = useDeviceStore()

interface EmulatorConfiguration {
  commandLine: string; // 启动参数，用于从命令行启动指定模拟器
  delay: 30 | 60 | 120 | 300 | 600; // 等待模拟器启动完成的延迟
}

const delayOptions = [
  {
    value: 30,
    label: '30秒 - 不建议'
  },
  {
    value: 60,
    label: '一分钟'
  },
  {
    value: 120,
    label: '两分钟'
  },
  {
    value: 300,
    label: '五分钟'
  },
  {
    value: 600,
    label: '十分钟'
  }
]

const props = defineProps<{
  configurations: EmulatorConfiguration;
}>()

const routeUuid = router.currentRoute.value.params.uuid as string

const commandLine = deviceStore.getDevice(routeUuid)?.commandLine
if (commandLine) {
  _.set(props.configurations, 'commandLine', commandLine)
}

</script>
<template>
  <div class="configuration-form">
    <NSpace vertical>
      <NFormItem label="启动后延迟" :show-label="true" size="small" label-align="left" label-placement="left" :show-feedback="false">
        <NSelect
          :value="props.configurations.delay"
          @update:value="(value) => _.set(props.configurations, 'delay', value)"
          :options="delayOptions"
        />
      </NFormItem>
       <NFormItem label="当前参数" :show-label="true" size="small" label-align="left" label-placement="left" :show-feedback="false">
        <NInput
          :disabled="true"
          :value="configurations.commandLine"
        />
      </NFormItem>
    </NSpace>
  </div>
</template>
