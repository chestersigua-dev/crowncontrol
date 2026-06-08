import { SettingsRepository } from './repository';
import { CreateSectionDTO, CreateCriteriaDTO } from './dto';

export class SettingsService {
  private repository = new SettingsRepository();

  async getSections() {
    return this.repository.getAllSections();
  }

  async getActiveSection() {
    const active = await this.repository.getActiveSection();
    if (!active) {
      throw new Error('No pageant section is currently active');
    }
    return active;
  }

  async createSection(data: CreateSectionDTO) {
    return this.repository.createSection(data);
  }

  async updateSection(id: string, data: Partial<CreateSectionDTO>) {
    return this.repository.updateSection(id, data);
  }

  async deleteSection(id: string) {
    return this.repository.deleteSection(id);
  }

  async activateSection(id: string) {
    const section = await this.repository.getSectionById(id);
    if (!section) {
      throw new Error('Section not found');
    }
    return this.repository.setActiveSection(id);
  }

  async addCriteria(data: CreateCriteriaDTO) {
    const section = await this.repository.getSectionById(data.pageantSectionId);
    if (!section) {
      throw new Error('Target section not found');
    }

    // Check sum of weights
    const currentWeightSum = section.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (currentWeightSum + data.weight > 1.01) {
      console.warn(`Warning: Total criteria weight for section ${section.name} exceeds 1.0 (currently ${currentWeightSum + data.weight})`);
    }

    return this.repository.createCriteria(data);
  }

  async removeCriteria(id: string) {
    return this.repository.deleteCriteria(id);
  }

  async getBranding() {
    let title = 'CrownControl';
    let logo = '👑';
    let publicRankingsEnabled = true;
    try {
      const titleSetting = await this.repository.getSetting('app_title');
      const logoSetting = await this.repository.getSetting('app_logo');
      const rankingsEnabledSetting = await this.repository.getSetting('public_rankings_enabled');
      if (titleSetting) title = titleSetting.value;
      if (logoSetting) logo = logoSetting.value;
      if (rankingsEnabledSetting) publicRankingsEnabled = rankingsEnabledSetting.value === 'true';
    } catch (e) {
      // ignore
    }
    return { title, logo, publicRankingsEnabled };
  }

  async updateBranding(title: string, logo: string, publicRankingsEnabled: boolean) {
    await this.repository.upsertSetting('app_title', title);
    await this.repository.upsertSetting('app_logo', logo);
    await this.repository.upsertSetting('public_rankings_enabled', String(publicRankingsEnabled));
    return { title, logo, publicRankingsEnabled };
  }

  async resetSystem() {
    return this.repository.resetSystemData();
  }
}
