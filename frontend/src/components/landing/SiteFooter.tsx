import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LegalTermsModal, type LegalDocumentType } from '@/components/auth/LegalTermsModal'
import { Brand } from '@/components/Brand'

const FOOTER_LINK_CLASS =
  'text-ink-600 transition-colors hover:text-ink-900 dark:text-zinc-400 dark:hover:text-white'

export function SiteFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<LegalDocumentType>('terms')

  function openLegalModal(type: LegalDocumentType) {
    setModalType(type)
    setIsModalOpen(true)
  }

  return (
    <footer className="mt-auto border-t border-paper-200 bg-paper-100 transition-colors duration-300 dark:border-white/10 dark:bg-night-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Brand />
          <p className="max-w-xs text-sm leading-relaxed text-paper-600 dark:text-zinc-500">
            Trabalho de conclusão de curso da Universidade de Mogi das Cruzes,{' '}
            {new Date().getFullYear()}.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <Link to="#" className={FOOTER_LINK_CLASS}>
            Sobre o projeto
          </Link>
          <button
            type="button"
            onClick={() => openLegalModal('terms')}
            className={`${FOOTER_LINK_CLASS} cursor-pointer bg-transparent p-0 text-left`}
          >
            Termos de uso
          </button>
          <button
            type="button"
            onClick={() => openLegalModal('privacy')}
            className={`${FOOTER_LINK_CLASS} cursor-pointer bg-transparent p-0 text-left`}
          >
            Privacidade
          </button>
        </nav>
      </div>

      <LegalTermsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentType={modalType}
      />
    </footer>
  )
}
