export const APP_NAME = 'VESSEL';
export const APP_SUBTITLE = 'Gestão de Colaboradores';
export const APP_TAGLINE = 'Organização • Pessoas • Informação • Resultado';
export const ORGANIZATION_NAME = 'Gestão Integrada de Colaboradores';

export const CATEGORIA_COLABORADOR_OPTIONS = [
  { value: 'gabinete', label: 'Gabinete' },
  { value: 'casa', label: 'Casa' },
  { value: 'vice_presidencia', label: 'Vice-Presidência' },
  { value: 'pmbv', label: 'PMBV' },
] as const;

export const CATEGORIA_COLABORADOR_LABELS = Object.fromEntries(
  CATEGORIA_COLABORADOR_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<(typeof CATEGORIA_COLABORADOR_OPTIONS)[number]['value'], string>;

export const STATUS_OPTIONS = [
  { value: 'positivado', label: 'Positivado' },
  { value: 'negativado', label: 'Negativado' },
  { value: 'nao_avaliado', label: 'Neutro' },
];

export const CARGO_OPTIONS = [
  'Assessor',
  'Assessora',
  'Coordenador',
  'Coordenadora',
  'Auxiliar',
  'Secretário',
  'Secretária',
  'Motorista',
  'Recepcionista',
  'Outro',
];

export const TIPO_PUBLICACAO_OPTIONS = [
  { value: 'feed', label: 'Feed' },
  { value: 'story', label: 'Story' },
  { value: 'reels', label: 'Reels' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'shorts', label: 'Shorts' },
];

export const REDE_SOCIAL_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
];

export const BAIRROS_BOA_VISTA = [
  'Centro',
  'Caçari',
  'Pricumã',
  'Cidade Satélite',
  'Jardim Floresta',
  'Centenário',
  'São Vicente',
  'Caranã',
  'Mecejana',
  'Paraviana',
  'Buritis',
  'São Pedro',
  'Asa Branca',
  'Santa Teresa',
  'Cambará',
  'Distrito Industrial',
  'Silvio Botelho',
  'Senador Hélio Campos',
  'Raiar do Sol',
  'Santa Luzia',
  'Pintolândia',
  'Jóquei Clube',
  'Tancredo Neves',
  'Bela Vista',
  'Caimbé',
  'Cinturão Verde',
  'Operário',
  '13 de Setembro',
  '31 de Março',
  'Liberdade',
];

export const MAP_CENTER = { lat: 2.8195, lng: -60.6714 }; // Boa Vista - RR
export const MAP_DEFAULT_ZOOM = 13;
