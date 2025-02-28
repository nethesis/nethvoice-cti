declare module '@nethesis/phone-island' {
  export interface PhoneIslandProps {
    dataConfig: string;
    uaType: 'desktop' | 'mobile';
  }

  export const PhoneIsland: React.FC<PhoneIslandProps>;
}
