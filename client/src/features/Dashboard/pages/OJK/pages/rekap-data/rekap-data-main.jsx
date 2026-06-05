// src/ojk/rekap/pages/rekap-data-main.jsx
import React, { useMemo, useState, useRef } from 'react';
import Header from '../../components/ui/header';
import { useHeaderStore } from '../../store/header';
import { Button } from '@/components/ui/button';
import { ArrowBigLeftDash, ArrowBigRightDash, Save } from 'lucide-react';
import UnsaveChangesModal from '../../components/unsave-changed-modal';
import { KategoriFilter, SimpleTable } from './components/rekap-data.components';
import { CATEGORIES, PAGE_SIZE } from './contants/rekap-data.contants.js';
import { useRekapData, useScrollDrag, useHorizontalScroll } from './hooks/rekap-data.hook.ts';
import { calculateGlobalSummary } from './utils/rekap-data.utils.js';

export default function RekapData() {
  const { year, activeQuarter, search } = useHeaderStore();

  const {
    dataMap,
    isLoading,
    error,
    selectedPages,
    hasUnsavedChanges,
    filter,
    flattenedRows,
    showUnsaveModal,
    saveAllChanges,
    selectAllPages,
    deselectAllPages,
    togglePage,
    updateFilter,
    confirmAction,
    cancelAction,
    updateRawValue,
    setHasUnsavedChanges,
    setShowUnsaveModal,
    setPendingAction,
    setFilter,
    refreshData,
  } = useRekapData(year, activeQuarter);

  // ====================== KATEGORI FILTER STATE ======================
  const [kategoriFilter, setKategoriFilter] = useState({
    model: filter.model || '',
    prinsip: filter.prinsip || '',
    jenis: filter.jenis || '',
    underlying: filter.underlying || [],
  });

  // ====================== REFS ======================
  const kategoriScrollRef = useRef(null);
  const paginationRef = useRef(null);

  // ====================== SCROLL HOOKS ======================
  const { handleMouseDown, handleMouseLeave } = useScrollDrag(kategoriScrollRef);
  useHorizontalScroll(kategoriScrollRef);

  // ====================== PAGINATION ======================
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(flattenedRows.length / PAGE_SIZE));

  const pagedRows = flattenedRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // ====================== GLOBAL SUMMARY ======================
  const globalSummary = useMemo(() => {
    return calculateGlobalSummary(dataMap, selectedPages, kategoriFilter);
  }, [dataMap, selectedPages, kategoriFilter]);

  // ====================== HANDLERS ======================

  const toggleAllPages = () => {
    if (selectedPages.length === CATEGORIES.length) {
      deselectAllPages();
    } else {
      selectAllPages();
    }
  };

  const handleFilterChange = (newFilter) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => {
        setKategoriFilter(newFilter);
        setFilter(newFilter);
        setHasUnsavedChanges(false);
      });
      setShowUnsaveModal(true);
    } else {
      setKategoriFilter(newFilter);
      setFilter(newFilter);
    }
  };

  // HANYA update state, TIDAK save (batch save)
  const handleUpdateRawValue = ({ categoryId, paramId, itemId, field, value }) => {
    updateRawValue({ categoryId, paramId, itemId, field, value });
  };

  const handleSaveAllChanges = () => {
    saveAllChanges();
  };

  const handlePageClick = (page) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => {
        setCurrentPage(page);
        setHasUnsavedChanges(false);
      });
      setShowUnsaveModal(true);
    } else {
      setCurrentPage(page);
    }
  };

  const scrollPaginationLeft = () => {
    paginationRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollPaginationRight = () => {
    paginationRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // ====================== MODAL HANDLERS ======================

  const handleModalSave = () => {
    handleSaveAllChanges();
    confirmAction();
  };

  const handleModalDontSave = () => {
    confirmAction();
    setHasUnsavedChanges(false);
  };

  const handleModalClose = () => {
    cancelAction();
  };

  // ====================== RENDER ======================
  return (
    <div className="space-y-4">
      <Header title="Rekap Data" />

      <div className="bg-white rounded-lg p-4 shadow space-y-4">
        {/* CATEGORY SELECTION */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Kategori Halaman</h3>
            <div className="flex gap-2">
              <button
                onClick={toggleAllPages}
                className="px-3 py-1.5 text-xs bg-blue-900 text-white rounded-md hover:bg-gray-500 transition-colors"
              >
                {selectedPages.length === CATEGORIES.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-700 to-sky-600 p-2 rounded-lg">
            <div className="max-w-[1560px] mx-auto">
              <div
                ref={kategoriScrollRef}
                className="flex gap-4 overflow-x-auto pb-2 cursor-grab scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-200"
                style={{
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
              >
                {CATEGORIES.map((c) => {
                  const Icon = c.Icon;
                  const active = selectedPages.includes(c.id);
                  return (
                    <Button
                      key={c.id}
                      onClick={() => togglePage(c.id)}
                      className={
                        active
                          ? 'bg-blue-900 text-white flex-shrink-0 hover:bg-gray-300 hover:text-black'
                          : 'bg-white text-black flex-shrink-0 hover:bg-blue-900 hover:text-white'
                      }
                    >
                      {Icon && <Icon className="w-4 h-4 mr-2" />}
                      {c.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {selectedPages.length} dari {CATEGORIES.length} kategori terpilih
          </div>
        </div>

        {/* KATEGORI FILTER */}
        {selectedPages.length > 0 && (
          <KategoriFilter
            filter={kategoriFilter}
            setFilter={setKategoriFilter}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* SAVE BUTTON */}
        <div className="flex justify-end gap-2">
          {hasUnsavedChanges && (
            <div className="flex items-center mr-4 text-yellow-600 text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Ada perubahan yang belum disimpan
            </div>
          )}

          <Button
            onClick={handleSaveAllChanges}
            className={`flex items-center gap-2 ${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            disabled={!hasUnsavedChanges}
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </Button>
        </div>

        {/* SIMPLE TABLE */}
        {selectedPages.length === 0 ? (
          <div className="border rounded-xl p-6 text-center text-gray-500">
            Pilih kategori halaman terlebih dahulu
          </div>
        ) : isLoading ? (
          <div className="border rounded-xl p-6 text-center text-gray-500">
            Memuat data...
          </div>
        ) : error ? (
          <div className="border rounded-xl p-6 text-center text-red-500">
            Error: {error}
            <button onClick={refreshData} className="ml-2 text-blue-600 underline">
              Coba lagi
            </button>
          </div>
        ) : (
          <SimpleTable
            rows={pagedRows}
            onUpdateRawValue={handleUpdateRawValue}
            filterKategori={kategoriFilter}
            key={`simple-table-${currentPage}`}
          />
        )}

        {/* PAGINATION */}
        {flattenedRows.length > PAGE_SIZE && (
          <div className="mt-3 flex justify-center items-center gap-4">
            {totalPages > 7 && (
              <button type="button" onClick={scrollPaginationLeft}
                className="h-10 w-10 flex items-center justify-center rounded-md border bg-white text-blue-600 font-bold hover:bg-blue-500 hover:text-white">
                <ArrowBigLeftDash className="w-4 h-4" />
              </button>
            )}

            <div className="max-w-[420px] overflow-x-hidden">
              <div ref={paginationRef} className="flex gap-2 px-2 py-1 overflow-x-auto scroll-smooth">
                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  return (
                    <button key={page} type="button" onClick={() => handlePageClick(page)}
                      className={
                        'min-w-8 h-8 px-3 flex items-center justify-center rounded-md border text-sm font-semibold transition-colors duration-150 shrink-0 hover:bg-blue-600 hover:text-white ' +
                        (isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-blue-600')
                      }>
                      {page}
                    </button>
                  );
                })}
              </div>
            </div>

            {totalPages > 7 && (
              <button type="button" onClick={scrollPaginationRight}
                className="h-10 w-10 flex items-center justify-center rounded-md border bg-white text-blue-600 font-bold hover:bg-blue-500 hover:text-white">
                <ArrowBigRightDash className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* UNSAVED CHANGES MODAL */}
      <UnsaveChangesModal
        isOpen={showUnsaveModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDontSave={handleModalDontSave}
        title="Ada Perubahan yang Belum Disimpan"
        message="Anda memiliki perubahan yang belum disimpan. Apa yang ingin Anda lakukan?"
        saveText="Simpan dan Lanjutkan"
        dontSaveText="Lanjutkan Tanpa Simpan"
        cancelText="Batal"
      />
    </div>
  );
}