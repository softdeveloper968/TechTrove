import React, { useState } from 'react';
import { useTable, Column } from 'react-table';
import { FaChevronDown } from 'react-icons/fa';

type ExtendedColumn<T extends object> = Column<T> & {
  Cell?: ({ value, row }: { value: any; row: T }) => JSX.Element;
};
// Define a type for the items in the data array
interface DataItem {
  id: string;
  type?:number;
  // Add other properties as needed
}

interface ExpandableTableProps<T extends DataItem> {
  data: T[];
  columns: ExtendedColumn<T>[]; // Use ExtendedColumn<T> here
  onExpand: (id: string) => Promise<any>; // Callback function for row expansion
  expandedColumns: ExtendedColumn<any>[]; 
}


const ExpandableGrid = <T extends DataItem>({ data, columns, onExpand,expandedColumns }: ExpandableTableProps<T>) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleExpand = async (id: string) => {
    setLoading(true);
    try {
      // If the clicked row is already expanded, close it
      if (expandedRow === id) {
        setExpandedRow(null);
        setExpandedData(null);
      } else {
        // Otherwise, expand the clicked row
        const expandedData = await onExpand(id);
        setExpandedData(expandedData);
        setExpandedRow(id);
      }
    } catch (error) {
      console.error('Error expanding row:', error);
    }
    setLoading(false);
  };
  

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<T>({ columns, data });

  return (
    <div className='max-h-[420px] md:max-h-[620px] relative overflow-x-auto tableGrid transactionGrid '>
      <table className='w-full text-left' {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            <th className='w-8 px-2.5 py-2.5 whitespace-nowrap sticky top-0 bg-gray-50 font-semibold text-[12px] md:text-[12.5px] z-10'></th>
            {headerGroup.headers.map(column => (
              <th className={`px-1.5 py-2.5 whitespace-nowrap sticky top-0 bg-gray-50 font-semibold text-[12px] md:text-[12.5px] z-10 ${column.render('Header')}`} {...column.getHeaderProps()} >{column.render('Header')}</th>
            ))}            
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <React.Fragment key={row.id}>
              <tr className='bg-white border-b' {...row.getRowProps()}>
              <td className='px-2.5 py-2 md:py-2.5 font-normal text-[10.5px] md:text-[11px] text-[#2a2929]'>
              {row.original.type !== 1 && (
                      <FaChevronDown className='h-5 w-5 p-1 cursor-pointer icon mx-auto fill-[#1659b3]' onClick={() => handleExpand(row.original.id)} />
                    )}                 
                </td>
                {row.cells.map(cell => (
                  <td className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929] ${cell.column.id}`} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}                
              </tr>
              {expandedRow === row.original.id && (
                <tr className='bg-white border-b expand_row'>
                  <td className='px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]' colSpan={columns.length+1}>
                    {loading ? <p>Loading...</p> : (
                       <GridComponent data={expandedData} columns={expandedColumns} />
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
    </div>
  );
};


const GridComponent = ({ data, columns }: { data: any[]; columns: ExtendedColumn<any>[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr>
            {columns.map(column => (
              <th className={`px-2.5 py-2.5 whitespace-nowrap bg-[#ededed] font-semibold text-[12px] md:text-[12.5px] text-left CaseNo ${column.Header}`} key={column.accessor as string}>
                {column.Header as string}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td className={`px-2.5 py-2 md:py-2.5 font-normal text-[10.5px] md:text-[11px] text-[#2a2929] ${column.Header}`} key={column.accessor as string}>
                  {column.Cell ? column.Cell({ value: row[column.accessor as string], row }) : row[column.accessor as string]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};



export default ExpandableGrid;
