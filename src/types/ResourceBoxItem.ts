import { ApiResourceBoxDetail } from './api/ApiResourceBox';
import LiveBonus from './LiveBonus';
import Material from './Material';
import { SkillUpScore } from './SkillUpScore';

export default class ResourceBoxItem {
  private item: string;
  private quantity: number;

  public constructor(item: string, quantity: number) {
    this.item = item;
    this.quantity = quantity;
  }

  public static fromApi(obj: ApiResourceBoxDetail): ResourceBoxItem {
    const { resourceType, resourceId, resourceQuantity } = obj;

    let item: string;
    switch (resourceType) {
      case 'jewel':
        item = 'Crystal';
        break;
      case 'coin':
        item = 'Coin';
        break;
      case 'stamp':
        item = 'Stamp';
        break;
      case 'avatar_costume':
        item = 'Avatar costume';
        break;
      case 'honor':
      case 'bonds_honor':
        item = 'Title';
        break;
      case 'bonds_honor_word':
        item = 'Title text';
        break;
      case 'material':
        item = Material.get(resourceId);
        break;
      case 'boost_item':
        item = LiveBonus.get(resourceId);
        break;
      case 'skill_practice_ticket':
        item = SkillUpScore.get(resourceId);
        break;
    }

    return new ResourceBoxItem(item, resourceQuantity);
  }

  public getItem(): string {
    return this.item;
  }

  public getQuantity(): number {
    return this.quantity;
  }
}
