import { createRouter, createWebHistory } from 'vue-router'
import Onboarding from '@/components/onboarding.vue'
import HomeView from '@/views/HomeView.vue'
import QuizView from '@/views/QuizView.vue'
import SkillsView from '@/views/SkillsView.vue'
import ExploreView from '@/views/ExploreView.vue'
import ExploreDetail from "@/views/ExploreDetail.vue";
import { useUserStore } from '@/stores/users';
import ResultView from "@/views/ResultView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "onboarding",
      component: Onboarding
    },
    {
      path: "/home",
      name: "home",
      component: HomeView
    },
    {
      path: "/quiz",
      name: "quiz",
      component: QuizView
    },
    {
      path: "/results",
      name: "results",
      component: ResultView
    },
    {
      path: "/explore",
      name: "explore",
      component: ExploreView
    },
    {
        path: "/explore/:slug",
        name: "explore-detail",
        component: ExploreDetail
    },
    {
      path: "/skills",
      name: "skills",
      component: SkillsView
    },
  ],
})

router.beforeEach((to) => {
  const userStore = useUserStore();

  const publicPages = ["onboarding"];

  // 🔥 WAIT until store is ready
  if (!userStore.isReady) return true;

  const loggedIn = !!userStore.currentUser;

  const authRequired = !publicPages.includes(to.name);

  if (authRequired && !loggedIn) {
    return { name: "onboarding" };
  }

  return true;
});

export default router