'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { PosHeader } from '@/components/organisms/pos/PosHeader';
import { PosCategories } from '@/components/organisms/pos/PosCategories';
import { PosProductGrid } from '@/components/organisms/pos/PosProductGrid';
import { CartDrawer } from '@/components/organisms/pos/CartDrawer';
import { PaymentModal } from '@/components/organisms/pos/PaymentModal';
import { usePOSLogic } from '@/hooks/usePOSLogic';
import { PosModals } from '@/components/organisms/pos/PosModals';

export default function POSPage() {
  const logic = usePOSLogic();
  const { state, data, handlers } = logic;
  const { getSubtotal, getDiscountAmount, getTaxAmount, getServiceChargeAmount, taxRate, serviceChargeRate, updateQty } = useCartStore();
  const { customers } = useCustomerStore();

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] overflow-hidden relative">
       {/* Bottom: Products Area */}
       <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
          <PosHeader
            searchQuery={state.searchQuery}
            setSearchQuery={state.setSearchQuery}
            sortOption={state.sortOption}
            handleSortChange={state.handleSortChange}
            viewOption={state.viewOption}
            handleViewChange={state.handleViewChange}
            setCustomItemOpen={state.setCustomItemOpen}
            setIsRecipeBookOpen={state.setIsRecipeBookOpen}
          />
          <PosCategories
            categories={data.categories}
            activeCategory={state.activeCategory}
            setActiveCategory={state.setActiveCategory}
          />
          <PosProductGrid
            filteredProducts={data.filteredProducts}
            categories={data.categories}
            viewOption={state.viewOption}
            handleProductClick={handlers.handleProductClick}
          />
       </div>

       {/* Floating Cart & Bottom Drawer overlay */}
       <CartDrawer
          items={data.items}
          isCartDrawerOpen={state.isCartDrawerOpen}
          setIsCartDrawerOpen={state.setIsCartDrawerOpen}
          getTotal={() => data.total}
          getSubtotal={getSubtotal}
          getDiscountAmount={getDiscountAmount}
          getTaxAmount={getTaxAmount}
          getServiceChargeAmount={getServiceChargeAmount}
          discountType={data.discountType}
          discountValue={data.discountValue}
          taxRate={taxRate}
          serviceChargeRate={serviceChargeRate}
          setLoadBillOpen={state.setLoadBillOpen}
          setSaveBillOpen={state.setSaveBillOpen}
          setClearConfirmOpen={state.setClearConfirmOpen}
          savedBills={data.savedBills}
          updateQty={updateQty}
          setIsDiscountOpen={state.setIsDiscountOpen}
          selectedCustomerId={state.selectedCustomerId}
          setSelectedCustomerId={state.setSelectedCustomerId}
          customers={customers}
          handleCheckoutClick={handlers.handleCheckoutClick}
       />

       {/* ================= PAYMENT MODAL ================= */}
       <PaymentModal
          isPaymentOpen={state.isPaymentOpen}
          setIsPaymentOpen={state.setIsPaymentOpen}
          paymentMethod={state.paymentMethod}
          setPaymentMethod={state.setPaymentMethod}
          cashGiven={state.cashGiven}
          setCashGiven={state.setCashGiven}
          qrisRef={state.qrisRef}
          setQrisRef={state.setQrisRef}
          handleOpenPaymentConfirm={handlers.handleOpenPaymentConfirm}
          total={data.total}
       />

       {/* ================= OTHER MODALS ================= */}
       <PosModals logic={logic} />
    </div>
  );
}
