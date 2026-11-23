/**
 * Authoritative BrainChop academic citations & BibTeX modal builder.
 */

export const CITATIONS = [
  {
    id: 'ecosystem',
    badge: 'Primary \u00b7 brainchop.org',
    title: 'BrainChop Edge Ecosystem',
    formatted:
      'Sergey M. Plis, Mohamed Masoud, Farfalla Hu, Taylor Hanayik, Satrajit S. Ghosh, Chris Drake, Roger Newman-Norlund, and Christopher Rorden. Brainchop: Providing an edge ecosystem for deployment of neuroimaging artificial intelligence models. Aperture Neuro, 4, 2024.',
    links: [
      { label: 'DOI: 10.52294/001c.123059', href: 'https://doi.org/10.52294/001c.123059' },
      {
        label: 'Aperture Neuro',
        href: 'https://apertureneuro.org/article/123059-brainchop-providing-an-edge-ecosystem-for-deployment-of-neuroimaging-artificial-intelligence-models',
      },
    ],
    bibtex: `@article{plis2024brainchop,
  author  = {Plis, Sergey M. and Masoud, Mohamed and Hu, Farfalla and Hanayik, Taylor and Ghosh, Satrajit S. and Drake, Chris and Newman-Norlund, Roger and Rorden, Christopher},
  title   = {Brainchop: Providing an edge ecosystem for deployment of neuroimaging artificial intelligence models},
  journal = {Aperture Neuro},
  volume  = {4},
  year    = {2024},
  doi     = {10.52294/001c.123059},
  url     = {https://doi.org/10.52294/001c.123059}
}`,
  },
  {
    id: 'mindgrab',
    badge: 'Skull Stripping \u00b7 MindGrab',
    title: 'MindGrab (Omnimodal Skull Stripping)',
    formatted:
      'Armina Fani, Mike Doan, Isabelle Le, Alex Fedorov, Malte Hoffmann, Chris Rorden, and Sergey Plis. MindGrab: A spectrally-motivated architecture for accessible deep learning in neuroimaging. NeuroImage, 338:122074, 2026.',
    links: [
      { label: 'DOI: 10.1016/j.neuroimage.2026.122074', href: 'https://doi.org/10.1016/j.neuroimage.2026.122074' },
      {
        label: 'ScienceDirect',
        href: 'https://www.sciencedirect.com/science/article/pii/S1053811926003897',
      },
      { label: 'PubMed (PMID: 42331200)', href: 'https://pubmed.ncbi.nlm.nih.gov/42331200/' },
    ],
    bibtex: `@article{fani2026mindgrab,
  author  = {Fani, Armina and Doan, Mike and Le, Isabelle and Fedorov, Alex and Hoffmann, Malte and Rorden, Chris and Plis, Sergey},
  title   = {MindGrab: A spectrally-motivated architecture for accessible deep learning in neuroimaging},
  journal = {NeuroImage},
  volume  = {338},
  pages   = {122074},
  year    = {2026},
  doi     = {10.1016/j.neuroimage.2026.122074},
  pmid    = {42331200},
  url     = {https://doi.org/10.1016/j.neuroimage.2026.122074}
}`,
  },
  {
    id: 'joss',
    badge: 'Original Software Paper',
    title: 'Original BrainChop Software Paper',
    formatted:
      'Mohamed Masoud, Farfalla Hu, and Sergey Plis. Brainchop: In-browser MRI volumetric segmentation and rendering. Journal of Open Source Software, 8(83):5098, 2023.',
    links: [
      { label: 'DOI: 10.21105/joss.05098', href: 'https://doi.org/10.21105/joss.05098' },
    ],
    bibtex: `@article{masoud2023brainchop,
  author    = {Masoud, Mohamed and Hu, Farfalla and Plis, Sergey},
  title     = {Brainchop: In-browser MRI volumetric segmentation and rendering},
  journal   = {Journal of Open Source Software},
  volume    = {8},
  number    = {83},
  pages     = {5098},
  year      = {2023},
  publisher = {The Open Journal},
  doi       = {10.21105/joss.05098},
  url       = {https://doi.org/10.21105/joss.05098}
}`,
  },
]

export function allBibtex() {
  return CITATIONS.map((c) => c.bibtex).join('\n\n') + '\n'
}

/**
 * Build the Cite BrainChop modal DOM tree programmatically (zero untrusted innerHTML).
 */
export function buildCiteModalContent() {
  const root = document.createElement('div')
  root.className = 'cite-sheet'

  const intro = document.createElement('p')
  intro.className = 'cite-intro'
  intro.textContent =
    'If you use brainchop.org in research, please cite the BrainChop Edge Ecosystem paper (primary reference), plus MindGrab when using skull stripping or the original JOSS software paper.'
  root.appendChild(intro)

  const copyWithFeedback = async (button, text, defaultLabel) => {
    const ok = await navigator.clipboard?.writeText(text).then(() => true, () => false)
    button.textContent = ok ? 'Copied!' : 'Copy failed'
    button.classList.toggle('is-copied', Boolean(ok))
    setTimeout(() => {
      button.textContent = defaultLabel
      button.classList.remove('is-copied')
    }, 1800)
  }

  for (const item of CITATIONS) {
    const card = document.createElement('section')
    card.className = 'cite-card'

    const head = document.createElement('div')
    head.className = 'cite-card-head'

    const title = document.createElement('h4')
    title.className = 'cite-card-title'
    title.textContent = item.title
    head.appendChild(title)

    const badge = document.createElement('span')
    badge.className = item.id === 'ecosystem' ? 'cite-badge cite-badge-primary' : 'cite-badge'
    badge.textContent = item.badge
    head.appendChild(badge)
    card.appendChild(head)

    const ref = document.createElement('p')
    ref.className = 'cite-ref'
    ref.textContent = item.formatted
    card.appendChild(ref)

    const linksRow = document.createElement('div')
    linksRow.className = 'cite-links'
    item.links.forEach((link, idx) => {
      if (idx > 0) {
        const sep = document.createElement('span')
        sep.className = 'cite-sep'
        sep.setAttribute('aria-hidden', 'true')
        sep.textContent = '\u00b7'
        linksRow.appendChild(sep)
      }
      const a = document.createElement('a')
      a.href = link.href
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.textContent = link.label
      linksRow.appendChild(a)
    })
    card.appendChild(linksRow)

    const details = document.createElement('details')
    details.className = 'cite-bib-details'
    if (item.id === 'ecosystem') details.open = true

    const summary = document.createElement('summary')
    summary.textContent = 'BibTeX'
    details.appendChild(summary)

    const pre = document.createElement('pre')
    pre.className = 'cite-bib'
    const code = document.createElement('code')
    code.textContent = item.bibtex
    pre.appendChild(code)
    details.appendChild(pre)
    card.appendChild(details)

    const actions = document.createElement('div')
    actions.className = 'cite-card-actions'

    const copyBibBtn = document.createElement('button')
    copyBibBtn.type = 'button'
    copyBibBtn.className = 'cite-copy-btn'
    copyBibBtn.dataset.citeCopy = item.id
    copyBibBtn.setAttribute('aria-label', `Copy BibTeX for ${item.title}`)
    copyBibBtn.textContent = 'Copy BibTeX'
    copyBibBtn.onclick = () => void copyWithFeedback(copyBibBtn, item.bibtex + '\n', 'Copy BibTeX')
    actions.appendChild(copyBibBtn)

    const copyTextBtn = document.createElement('button')
    copyTextBtn.type = 'button'
    copyTextBtn.className = 'cite-copy-btn cite-copy-secondary'
    copyTextBtn.setAttribute('aria-label', `Copy plain citation for ${item.title}`)
    copyTextBtn.textContent = 'Copy Text'
    copyTextBtn.onclick = () => void copyWithFeedback(copyTextBtn, item.formatted, 'Copy Text')
    actions.appendChild(copyTextBtn)

    card.appendChild(actions)
    root.appendChild(card)
  }

  const footer = document.createElement('div')
  footer.className = 'cite-footer'

  const legacyNote = document.createElement('span')
  legacyNote.className = 'cite-legacy-note'
  legacyNote.append('Need legacy v3 TF.js models? ')
  const v3Link = document.createElement('a')
  v3Link.href = './v3/'
  v3Link.textContent = 'Open BrainChop v3'
  legacyNote.appendChild(v3Link)
  footer.appendChild(legacyNote)

  const copyAllBtn = document.createElement('button')
  copyAllBtn.type = 'button'
  copyAllBtn.id = 'citeCopyAllBtn'
  copyAllBtn.className = 'stat-csv-btn'
  copyAllBtn.textContent = 'Copy All BibTeX'
  copyAllBtn.onclick = () => void copyWithFeedback(copyAllBtn, allBibtex(), 'Copy All BibTeX')
  footer.appendChild(copyAllBtn)

  root.appendChild(footer)
  return root
}
