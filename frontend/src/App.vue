<template>
	<router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUsersStore } from '@/stores/users_store.js'

const userStore = useUsersStore()
onMounted(() => {
	userStore.initUserSession()
})
</script>
