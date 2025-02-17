import { RatingSize } from '../../types/ratings';
import { iconService } from '../iconService';
import { getRatingSizeConfig } from '../../utils/ratingStyles';

interface Labels {
  excellent?: string;
  positive?: string;
  neutral?: string;
  negative?: string;
}

export async function generateCustomRating(
  baseUrl: string, 
  code: string, 
  size: RatingSize,
  labels?: Labels
): Promise<string> {
  try {
    const icons = await iconService.getCustomIcons();
    if (!icons.length) {
      throw new Error('Custom icons not found');
    }

    const sizeConfig = getRatingSizeConfig(size);
    const orderedValues = [5, 4, 3, 1];
    
    const getLabel = (value: number): string => {
      if (!labels) return '';
      if (value === 5) return labels.excellent || '';
      if (value === 4) return labels.positive || '';
      if (value === 3) return labels.neutral || '';
      if (value === 1) return labels.negative || '';
      return '';
    };

    const buttons = orderedValues
      .map(value => {
        const icon = icons.find(i => i.value === value);
        if (!icon) return '';

        const url = new URL(`rate/${code}`, baseUrl);
        url.searchParams.set('type', 'custom');
        url.searchParams.set('value', value.toString());
        
        const label = getLabel(value);
        const showLabel = label !== '';

        return `
          <td style="text-align:center; vertical-align:top; padding:0;">
            <div style="display:inline-block; min-width:${sizeConfig.starSize};">
              <a 
                href="${url.toString()}" 
                style="display:inline-block; text-decoration:none; margin-bottom:4px;"
              >
                <img 
                  src="${icon.url}" 
                  alt="${label}" 
                  style="width:${sizeConfig.starSize}; height:${sizeConfig.starSize}; opacity:0.5; vertical-align:middle;" 
                  title="${label}"
                />
              </a>
              ${showLabel ? `
                <div style="font-size:12px; color:#666; white-space:nowrap;">
                  ${label}
                </div>
              ` : ''}
            </div>
          </td>
          ${value !== 1 ? `<td style="width:${sizeConfig.spacing}"></td>` : ''}
        `;
      })
      .join('');

    return `
      <table cellpadding="0" cellspacing="0" style="display:inline-table; border-collapse:collapse;">
        <tr>
          ${buttons}
        </tr>
      </table>
    `;
  } catch (error) {
    console.error('Failed to generate custom rating:', error);
    return '';
  }
}