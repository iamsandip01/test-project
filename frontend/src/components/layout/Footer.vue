<template>
  <footer class="bg-neutral-800 text-white py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between">
        <div class="mb-6 md:mb-0">
          <h3 class="text-xl font-bold mb-2">EV Station Manager</h3>
          <p class="text-neutral-400 max-w-md">
            Streamlining the management of electric vehicle charging infrastructure for a sustainable future.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider mb-4">Platform</h4>
            <ul class="space-y-2">
              <li><router-link to="/" class="text-neutral-400 hover:text-white transition-colors">Home</router-link></li>
              <li><router-link to="/map" class="text-neutral-400 hover:text-white transition-colors">Map</router-link></li>
              <li><router-link to="/stations" class="text-neutral-400 hover:text-white transition-colors">Stations</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-neutral-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" class="text-neutral-400 hover:text-white transition-colors">API</a></li>
              <li><a href="#" class="text-neutral-400 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" class="text-neutral-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" class="text-neutral-400 hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-neutral-700">
        <p class="text-neutral-400 text-center">
          &copy; {{ new Date().getFullYear() }} EV Station Manager. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>