export const aiService = {
  estimatePropertyPrice(city: string, area: number) {
    const cityFactor = city === 'تهران' ? 85000000 : 35000000;
    return { city, area, estimatedPrice: cityFactor * area };
  },
};
