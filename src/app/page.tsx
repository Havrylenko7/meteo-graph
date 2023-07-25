'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';

import styles from './page.module.scss';
import { cities, header, countries } from './constants';
import { SelectedCity } from './types'

export default function Home() {
  const [cityList, setCityList] = useState<any>([]);
  const [selectedCity, setSelectedCity] = useState<SelectedCity>();
  const [chartData, setChartData] = useState<string[] | number[]>();
  const [countryFilter, setCountryFilter] = useState<string>();
  const [minFilter, setMinFilter] = useState<number>();
  const [maxFilter, setMaxFilter] = useState<number>();

  useEffect(() => {
    cities.map(city => {
      axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=GMT&past_days=7&forecast_days=1`
      ).then((res) => {
        const cityList = res.data; 
        cityList.name = city.name;
        cityList.country = city.country
        setCityList(prev => [...prev, cityList]);
      })
    })
  }, [])

  useEffect(() => {
    if (cityList[0])
    setSelectedCity({ date : cityList[0]?.daily.time, temperature: cityList[0]?.daily.temperature_2m_mean });
  }, [cityList])

  useEffect(() => {
    if(selectedCity) {
      const selectedData: any = [];

      selectedCity.temperature.map((item: number, index: number) => { 
        const dateId = selectedCity.date.findIndex((date: string, dateIndex: number) => dateIndex === index);
        const date = selectedCity.date[dateId]

        index !== 7 && selectedData.push({ temperature: item, day: dayjs(date).format('ddd') })
      }
    )  
      setChartData(selectedData)
    } 
  }, [selectedCity])

  return (
    <main className={styles.appWrapper}>
      {_.isEmpty(cityList) || !selectedCity ? (
        <div className={styles.loaderContainer}>
          <span className={styles.loadingItem} />
          <span className={styles.loadingItem} />
          <span className={styles.loadingItem} />
          <span className={styles.loadingItem} />
        </div>
      ) : (
        <>
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              Analytics
              <div className={styles.valueContainer}>
                <div className={styles.box} />
                Temperature, °C
              </div>
            </div>
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart width={150} height={40} data={chartData}>
                  <Bar dataKey="temperature" fill="#B3FC4F" />
                  <YAxis width={32} />
                  <XAxis
                    dataKey="day"
                    height={28}
                    style={{
                      fontWeight: 500,
                      letterSpacing: .14,
                    }}    
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.tablelContainer}>
            <div className={styles.filterContainer}>
              <select
                value={countryFilter}
                onChange={(event) => setCountryFilter(event.target.value)}
              >
                <option value="" disabled selected>Country</option>
                {countries.map((country) => 
                  <option value={country}>{country}</option>
                )}
              </select>
              <select
                value={maxFilter}
                onChange={(event) => setMaxFilter(parseInt(event.target.value))}
              >
                <option value="" disabled selected>Max</option>
                {_.range(80, -81, -1).map((temperature) => 
                  <option value={temperature}>{temperature}</option>
                )}
              </select>
              <select
                value={minFilter}
                onChange={(event) => setMinFilter(parseInt(event.target.value))}
              >
                <option value="" disabled selected>Min</option>
                {_.range(80, -81, -1).map((temperature) => 
                  <option value={temperature}>{temperature}</option>
                )}
              </select>
            </div>
            <div className={styles.table}>
                {[header, ...cityList]
                  .filter(city => city.max || !countryFilter || countryFilter === city.country)
                  .filter(city => city.max || !maxFilter || maxFilter < city.daily.temperature_2m_max[7])
                  .filter(city => city.max || !minFilter || minFilter > city.daily.temperature_2m_min[7])
                  .map((item) => 
                    <div
                      className={styles.row}
                      onClick={() => item.max || setSelectedCity({
                        date: item.daily.time,
                        temperature: item.daily.temperature_2m_mean
                      })}
                    >
                      <div>{item.name}</div>
                      <div>{item.max || item.daily.temperature_2m_max[7]}</div>
                      <div>{item.min || item.daily.temperature_2m_min[7]}</div>
                      <div>{item.wind || item.current_weather.winddirection}</div>
                    </div>
                  )
                }
            </div>
          </div>
        </>
      )}
    </main>
  )
}
