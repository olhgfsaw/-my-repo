import type { App } from 'vue';
import AuAgentAvatar from './components/AuAgentAvatar.vue';
import AuAgentCard from './components/AuAgentCard.vue';
import AuBreadcrumb from './components/AuBreadcrumb.vue';
import AuButton from './components/AuButton.vue';
import AuDelta from './components/AuDelta.vue';
import AuIcon from './components/AuIcon.vue';
import AuNavItem from './components/AuNavItem.vue';
import AuNavSection from './components/AuNavSection.vue';
import AuPageHeader from './components/AuPageHeader.vue';
import AuRailButton from './components/AuRailButton.vue';
import AuSparkline from './components/AuSparkline.vue';
import AuStatCard from './components/AuStatCard.vue';
import AuStatusPill from './components/AuStatusPill.vue';

export {
  AuAgentAvatar, AuAgentCard, AuBreadcrumb, AuButton, AuDelta, AuIcon, AuNavItem,
  AuNavSection, AuPageHeader, AuRailButton, AuSparkline, AuStatCard, AuStatusPill,
};
export { ICONS, ICON_NAMES, type IconName } from './components/icons';
export { STATUS_LABELS, STATUS_TONE, type AgentStatus, type SparkTone } from './components/types';

const components = {
  AuAgentAvatar, AuAgentCard, AuBreadcrumb, AuButton, AuDelta, AuIcon, AuNavItem,
  AuNavSection, AuPageHeader, AuRailButton, AuSparkline, AuStatCard, AuStatusPill,
};

/** Optional global registration: app.use(Aurelia) */
export default {
  install(app: App) {
    for (const [name, c] of Object.entries(components)) app.component(name, c);
  },
};
