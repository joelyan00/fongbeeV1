<template>
  <div class="max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">修改密码</h1>
      <p class="text-gray-500 mt-1">为了您的账号安全，建议定期修改密码</p>
    </div>
    <ChangePasswordForm />
  </div>
</template>

<script setup lang="ts">
import ChangePasswordForm from '../../components/ChangePasswordForm.vue'
</script>
