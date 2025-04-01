import React, { useEffect, useRef, useState } from 'react';
import DatePicker from "react-datepicker";
import Period from './Period';
import DonutChart from './DonutChart';
import arrow from "assets/images/select_arrow.png";
import { ChartConfiguration } from 'chart.js';
import Spinner from 'components/common/spinner/Spinner';
import { GetChartConfiguration } from 'utils/helper';
import { useAccountingContext } from '../AccountingContext';
import "react-datepicker/dist/react-datepicker.css";

const TransactionAnalyticsComponent: React.FC = () => {
  const isMounted = useRef(true);
  const [selectedPeriod, setSelectedPeriod] = useState(Period.ThisMonth);
  const [showTransactionSpinner, setShowTransactionSpinner] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [chartConfig, setChartConfig] = useState<ChartConfiguration | null>(null);
  const { companyDetails, getCompanyDetails } = useAccountingContext();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShowTransactionSpinner(true);
    setDateRange([null, null]);
    const value = parseInt(e.target.value, 10) as Period;
    setSelectedPeriod(value);
    await getCompanyDetails(value, null, null);
    setShowTransactionSpinner(false);
  };

  const getDataResponse = async (fromDate: Date | null, toDate: Date | null) => {
    if (fromDate && toDate) {
      setShowTransactionSpinner(true);
      await getCompanyDetails(0, fromDate, toDate);
      setShowTransactionSpinner(false);
    }
    else if (fromDate == null && toDate == null) {
      await getCompanyDetails(selectedPeriod, fromDate, toDate);
    }
  };

  useEffect(() => {
    if (isMounted.current) {
      setShowTransactionSpinner(true);
      getCompanyDetails(Period.ThisMonth, null, null);
      isMounted.current = false;
    }
    setShowTransactionSpinner(false);
  }, []);

  useEffect(() => {
    if (companyDetails.map(x=>x.companyName)[0] != "") {
      ;
      var config = GetChartConfiguration(companyDetails.map(x => x.companyName),companyDetails.map(x => x.transactionCount),"Transactions");
      setChartConfig(config as ChartConfiguration);
    }
  }, [companyDetails]);

  return (
    <div className='h-full rounded-md bg-white shadow-[0px_0px_14px_#523F691A] w-full border-1 border-[#F1F1F1] relative'>
      <div className='flex gap-1.5 sm:gap-0 flex-col sm:flex-row items-center justify-between py-3 px-3.5 min-h-[62px] border-b border-[#F0F1F5]'>
        <h2 className='text-[#0E294E] text-[13px] xl:text-[15px] font-medium leading-tight'>Transaction Analytics</h2>
        <div className='flex items-center gap-2'>
          <select
            value={selectedPeriod}
            onChange={handleChange}
            style={{ backgroundImage: `url(${arrow})` }}
            className='outline-none py-1.5 md:py-2 p-2.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#fcfcfc] disabled:text-[#a8aeb8] bg-no-repeat bg-[center_right_10px] appearance-none !pr-6 text-[#2472DB] font-medium max-w-28'>
            <option value={Period.ThisMonth}>This Month</option>
            <option value={Period.ThisWeek}>This Week</option>
            <option value={Period.ThisYear}>This Year</option>
          </select>
          <div>
            <DatePicker
              className="bg-calendar peer !placeholder-gray-500 outline-none py-1.5 md:py-2 p-2.5 !pr-7 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_10px]"
              selectsRange={true}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={(update: [Date | null, Date | null]) => {
                setDateRange(update);
                getDataResponse(update[0], update[1]);
              }}
              maxDate={new Date()}
              placeholderText={"Select DateRange"}
            />
          </div>
        </div>
      </div>
      <div className='my-4 mx-auto' style={{ height: '195px', width: '195px' }}>
      {showTransactionSpinner ? (
               <Spinner />
            ) : (
               <>
                 {chartConfig && <DonutChart chartConfig={chartConfig} />}
               </>
            )}
      </div>
    </div>
  );
};

export default TransactionAnalyticsComponent;
