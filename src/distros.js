// Yeni sürüm eklemek için ilgili ailenin `versions` listesine ['sürüm', 'kod adı'] ekle.
// slug: simple-icons logo adı (npm install sırasında src/logos/<slug>.svg olarak kopyalanır)
// glyph + color: logo bulunamazsa gösterilen yedek rozet
export const FAMILIES = [
  { slug: 'debian', name: 'Debian', color: '#d70a53', glyph: 'D', versions: [['10', 'buster'], ['11', 'bullseye'], ['12', 'bookworm'], ['13', 'trixie']] },
  { slug: 'ubuntu', name: 'Ubuntu', color: '#e95420', glyph: 'U', versions: [['20.04', 'Focal Fossa'], ['22.04', 'Jammy Jellyfish'], ['24.04', 'Noble Numbat'], ['24.10', 'Oracular Oriole'], ['25.04', 'Plucky Puffin']] },
  { slug: 'fedora', name: 'Fedora', color: '#51a2da', glyph: 'f', versions: [['39', ''], ['40', ''], ['41', ''], ['42', '']] },
  { slug: 'archlinux', name: 'Arch Linux', color: '#1793d1', glyph: 'A', versions: [['rolling', '']] },
  { slug: 'linuxmint', name: 'Linux Mint', color: '#87cf3e', glyph: 'M', dark: true, versions: [['21.3', 'Virginia'], ['22', 'Wilma'], ['22.1', 'Xia']] },
  { slug: 'opensuse', name: 'openSUSE', color: '#73ba25', glyph: 'S', dark: true, versions: [['Leap 15.5', ''], ['Leap 15.6', ''], ['Tumbleweed', 'rolling']] },
  { slug: 'alpinelinux', name: 'Alpine Linux', color: '#0d597f', glyph: 'A', versions: [['3.19', ''], ['3.20', ''], ['3.21', '']] },
  { slug: 'centos', name: 'CentOS Stream', color: '#932279', glyph: 'C', versions: [['9', ''], ['10', '']] },
  { slug: 'rockylinux', name: 'Rocky Linux', color: '#10b981', glyph: 'R', dark: true, versions: [['8.10', 'Green Obsidian'], ['9', 'Blue Onyx']] },
  { slug: 'almalinux', name: 'AlmaLinux', color: '#0f4266', glyph: 'A', versions: [['8', 'Sapphire Caracal'], ['9', 'Seafoam Ocelot']] },
  { slug: 'redhat', name: 'Red Hat Enterprise Linux', color: '#ee0000', glyph: 'R', versions: [['8', 'Ootpa'], ['9', 'Plow']] },
  { slug: 'oracle', name: 'Oracle Linux', color: '#c74634', glyph: 'O', versions: [['8', ''], ['9', '']] },
  { slug: 'amazonaws', name: 'Amazon Linux', color: '#ff9900', glyph: 'a', dark: true, versions: [['2', ''], ['2023', '']] },
  { slug: 'kalilinux', name: 'Kali Linux', color: '#367bf0', glyph: 'K', versions: [['2024.3', ''], ['2024.4', ''], ['2025.1', '']] },
  { slug: 'parrotsecurity', name: 'Parrot OS', color: '#15e0ba', glyph: 'P', dark: true, versions: [['6', 'Lory']] },
  { slug: 'manjaro', name: 'Manjaro', color: '#35bf5c', glyph: 'M', dark: true, versions: [['23', 'Uranos'], ['24', 'Wynsdey']] },
  { slug: 'endeavouros', name: 'EndeavourOS', color: '#7f3fbf', glyph: 'E', versions: [['', 'Mercury'], ['', 'Gemini']] },
  { slug: 'garudalinux', name: 'Garuda Linux', color: '#ae2d3f', glyph: 'G', versions: [['', 'Dr460nized']] },
  { slug: 'artixlinux', name: 'Artix Linux', color: '#10a0cc', glyph: 'A', versions: [['rolling', '']] },
  { slug: 'popos', name: 'Pop!_OS', color: '#48b9c7', glyph: 'P', dark: true, versions: [['22.04', ''], ['24.04', 'COSMIC']] },
  { slug: 'elementary', name: 'elementary OS', color: '#64baff', glyph: 'e', dark: true, versions: [['7.1', 'Horus'], ['8', 'Circe']] },
  { slug: 'zorin', name: 'Zorin OS', color: '#0cc1f3', glyph: 'Z', dark: true, versions: [['16', ''], ['17', '']] },
  { slug: 'mxlinux', name: 'MX Linux', color: '#2d2d2d', glyph: 'MX', versions: [['23', 'Libretto'], ['23.4', 'Libretto']] },
  { slug: 'deepin', name: 'deepin', color: '#007cff', glyph: 'd', versions: [['20.9', ''], ['23', '']] },
  { slug: 'gentoo', name: 'Gentoo Linux', color: '#54487a', glyph: 'G', versions: [['', '']] },
  { slug: 'slackware', name: 'Slackware', color: '#3a5f9e', glyph: 'S', versions: [['15.0', '']] },
  { slug: 'nixos', name: 'NixOS', color: '#5277c3', glyph: 'N', versions: [['24.05', 'Uakari'], ['24.11', 'Vicuña']] },
  { slug: 'voidlinux', name: 'Void Linux', color: '#478061', glyph: 'V', versions: [['', '']] },
  { slug: 'devuan', name: 'Devuan', color: '#6b6b6b', glyph: 'D', versions: [['4', 'Chimaera'], ['5', 'Daedalus']] },
  { slug: 'raspberrypi', name: 'Raspberry Pi OS', color: '#c51a4a', glyph: 'R', versions: [['', 'bullseye'], ['', 'bookworm']] },
  { slug: 'tails', name: 'Tails', color: '#56347c', glyph: 'T', versions: [['6.8', '']] },
  { slug: 'qubesos', name: 'Qubes OS', color: '#3874d8', glyph: 'Q', versions: [['4.1', ''], ['4.2', '']] },
  { slug: 'mageia', name: 'Mageia', color: '#2397d4', glyph: 'M', versions: [['8', ''], ['9', '']] },
  { slug: 'solus', name: 'Solus', color: '#5294e2', glyph: 'S', versions: [['4.6', 'Convergence']] },
  { slug: 'clearlinux', name: 'Clear Linux', color: '#0068b5', glyph: 'C', versions: [['41000', '']] },
  { slug: 'pardus', name: 'Pardus', color: '#f2b705', glyph: 'P', dark: true, versions: [['21', 'Yirmibir'], ['23', 'Yirmiüç']] },
  { slug: 'freebsd', name: 'FreeBSD', color: '#ab2b28', glyph: 'F', versions: [['13.4', ''], ['14.1', '']] },
];

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const DISTROS = FAMILIES.flatMap((f) =>
  f.versions.map(([version, code]) => ({
    id: slugify([f.slug, version, code].filter(Boolean).join('-')),
    slug: f.slug,
    family: f.name,
    version,
    code,
    name: [f.name, version, code].filter(Boolean).join(' '),
    color: f.color,
    glyph: f.glyph,
    dark: !!f.dark,
  }))
);
