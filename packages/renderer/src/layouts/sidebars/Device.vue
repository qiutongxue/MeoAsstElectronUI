<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NIcon,
  NSpace,
  NButton,
  NTooltip,
  NText,
  NTime
  // useMessage
} from 'naive-ui'
// import { useI18n } from 'vue-i18n'
import IconRefresh from '@/assets/icons/refresh.svg?component'
import IconSettings from '@/assets/icons/settings.svg?component'
import DeviceCard from '@/components/Device/DeviceCard.vue'

import useDeviceStore from '@/store/devices'
import useSettingStore from '@/store/settings'

import { installCore, checkCoreVersion } from '@/utils/core'
import { installAdb } from '@/utils/adb'
import { show } from '@/utils/message'

// const { t } = useI18n()
const connectedStatus: Set<DeviceStatus> = new Set(['connected', 'tasking'])
const disconnectedStatus: Set<DeviceStatus> = new Set([
  'available',
  'disconnected',
  'connecting'
])
const deviceStore = useDeviceStore()
const settingStore = useSettingStore()
// const message = useMessage()
const connectedDevices = computed(() =>
  deviceStore.devices.filter((device) => connectedStatus.has(device.status))
)
const disconnectedDevices = computed(() =>
  deviceStore.devices.filter((device) => disconnectedStatus.has(device.status))
)

// const unknownDevices = computed(() =>
//   deviceStore.devices.filter((device) => device.status === 'unknown')
// )
// TODO: 从maa启动模拟器的支持

/**
 * @description 过滤不可用的连接设备，并在神谕上提示
 */
function deviceInfoParser (devices: Device[]): any[] {
  const ret: any[] = []
  devices.forEach((info) => {
    let status = 'available'
    if (!info.uuid) {
      show(
        `设备 ${info.address} 连接失败, 请检查是否开启了 USB 调试, 或请详细阅读使用文档捏`,
        {
          type: 'error',
          duration: 0,
          closable: true
        },
        false
      )
      status = 'unknown'
    } else {
      ret.push({
        status: status,
        uuid: info.uuid,
        connectionString: info.address,
        config: info.config,
        commandLine: info.commandLine,
        adbPath: info.adbPath,
        pid: info.pid,
        displayName: info.displayName
      })
    }
  })
  if (ret.length === 0) {
    show(
      '未找到任何可用设备! 请重试',
      {
        type: 'info',
        duration: 0,
        closable: true
      },
      true
    )
  } else {
    show(
      `已找到 ${ret.length} 台可用设备`,
      {
        type: 'info'
      },
      true
    )
  }
  return ret
}

async function handleRefreshDevices () {
  if (!(await checkCoreVersion())) {
    await installCore()
    await installAdb()
    return
  }
  show('正在更新设备列表...', { type: 'loading', duration: 0 })

  window.ipcRenderer.invoke('main.DeviceDetector:getEmulators').then((ret) => {
    const devices = deviceInfoParser(ret)
    deviceStore.mergeSearchResult(devices)
  })
}

const now = ref(Date.now())

setInterval(() => {
  now.value = Date.now()
}, 1000)
</script>

<template>
  <div>
    <NButton
      text
      style="font-size: 24px"
      @click="$router.push({ path: '/settings' })"
    >
      <NIcon>
        <IconSettings />
      </NIcon>
    </NButton>
    <h2>当前连接的设备</h2>
    <div class="connected-devices">
      <DeviceCard
        v-for="device in connectedDevices"
        :uuid="device.uuid"
        :key="device.uuid"
      />
    </div>
    <NSpace :justify="'space-between'" :align="'center'">
      <h2>可用的设备列表</h2>
      <NTooltip>
        <template #trigger>
          <NButton
            text
            style="font-size: 24px"
            @click="handleRefreshDevices"
            :disabled="settingStore.version.core === undefined ? true : false"
          >
            <NIcon>
              <IconRefresh />
            </NIcon>
          </NButton>
        </template>
        刷新
      </NTooltip>
    </NSpace>
    <div class="disconnected-devices">
      <DeviceCard
        v-for="device in disconnectedDevices"
        :uuid="device.uuid"
        :key="device.uuid"
      />
    </div>
    <!-- <div class="unknown-devices">
      <DeviceCard
        v-for="device in unknownDevices"
        :uuid="device.uuid"
        :key="device.uuid"
      />
    </div> -->
    <div :style="{ textAlign: 'center' }">
      <NText depth="2">
        {{ $t("common.lastUpdate") }}:&nbsp;
        <span v-if="deviceStore.lastUpdate === null">从不</span>
        <NTime
          v-else
          :time="deviceStore.lastUpdate"
          :to="now"
          type="relative"
        />
      </NText>
    </div>
  </div>
</template>
