import { Button } from '@/components/ui/button';

export default function PopUpDelete({ open, onOpenChange, title, description, itemName, itemNomor, itemJudul, itemAspekNomor, itemAspekJudul, itemType, onConfirm, onCancel, confirmText = 'Hapus', cancelText = 'Batal', isLoading = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onCancel} disabled={isLoading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">{description}</p>

          {/* Informasi detail item yang akan dihapus */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="space-y-3">
              {/* Informasi Aspek (untuk pertanyaan) */}
              {itemAspekNomor && itemAspekJudul && (
                <div className="pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dalam Aspek</span>
                  </div>
                  <div className="space-y-1 pl-3">
                    <div className="flex">
                      <span className="font-medium w-16 text-gray-700 text-sm">No. Aspek</span>
                      <span className="font-semibold text-gray-900 text-sm">: {itemAspekNomor}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16 text-gray-700 text-sm">Judul</span>
                      <span className="font-semibold text-gray-900 text-sm line-clamp-2">: {itemAspekJudul}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Informasi Item Utama */}
              <div className="space-y-2">
                {itemNomor && (
                  <div className="flex items-start">
                    <span className="font-medium w-20 text-gray-700">Nomor</span>
                    <div className="font-semibold text-gray-900">
                      <span className=" text-sm  mr-2">: {itemNomor}</span>
                    </div>
                  </div>
                )}

                {itemJudul && (
                  <div className="flex items-start">
                    <span className="font-medium w-20 text-gray-700">Judul</span>
                    <span className="font-semibold text-gray-900 flex-1 line-clamp-3">: {itemJudul}</span>
                  </div>
                )}

                <div className="flex items-center pt-2 border-t border-gray-100">
                  <span className="font-medium w-20 text-gray-700">Tipe</span>
                  <span className="capitalize font-semibold text-gray-900 text-sm">: {itemType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning message */}
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.404 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-700 font-medium">Tindakan ini tidak dapat dibatalkan. Semua data terkait akan hilang.</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onCancel} disabled={isLoading} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{confirmText}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
