import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IpLocationApiConfig } from '../../config/api/ip-location-api.config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { IpGeolocationRespondedDto } from './dto/ipgeolocation.responded.dto';
import { firstValueFrom, map, Observable } from 'rxjs';
import { IpLocationResponseDto } from '../dto/ip-location.response.dto';
import { IpStackRespondedDto } from './dto/ipstack.responded.dto';

@Injectable()
export class LookupExternalApiService {
  private readonly ipApiBuilder;
  private readonly ipStackApiBuilder;
  private readonly ipGeolocationApiBuilder;
  private readonly findLocationIterator: Generator<
    (ip: string) => Observable<IpLocationResponseDto>,
    null
  >;
  constructor(
    @Inject(IpLocationApiConfig.KEY)
    private readonly apiConfig: ConfigType<typeof IpLocationApiConfig>,
    private readonly httpService: HttpService,
  ) {
    const { ip_api, ip_geolocation_api, ip_stack_api } = apiConfig;
    this.ipApiBuilder = ip_api;
    this.ipGeolocationApiBuilder = ip_geolocation_api;
    this.ipStackApiBuilder = ip_stack_api;
    this.findLocationIterator = this.findLocationGenerator();
  }

  private *findLocationGenerator() {
    while (true) {
      yield this.findLocationByIpApi.bind(this);
      yield this.findLocationByIpGeolocationApi.bind(this);
      yield this.findLocationByIpStackApi.bind(this);
    }

    return null;
  }

  async findLocation(ip: string) {
    const { value: apiFunction } = this.findLocationIterator.next();
    return await firstValueFrom<IpLocationResponseDto>(apiFunction(ip));
  }

  findLocationByIpApi(ip: string): Observable<IpLocationResponseDto> {
    return this.httpService
      .get<IpGeolocationRespondedDto>(this.ipApiBuilder(ip))
      .pipe(
        map((response) => {
          const { ip, longitude, latitude } = response.data;
          if (response.status !== 200) {
            throw new InternalServerErrorException();
          }
          return IpLocationResponseDto.to(
            ip,
            parseFloat(latitude),
            parseFloat(longitude),
          );
        }),
      );
  }

  findLocationByIpStackApi(ip: string): Observable<IpLocationResponseDto> {
    return this.httpService
      .get<IpStackRespondedDto>(this.ipStackApiBuilder(ip))
      .pipe(
        map((response) => {
          if (response.status !== 200) {
            throw new InternalServerErrorException();
          }
          const { ip, longitude, latitude } = response.data;
          return IpLocationResponseDto.to(ip, latitude, longitude);
        }),
      );
  }

  findLocationByIpGeolocationApi(
    ip: string,
  ): Observable<IpLocationResponseDto> {
    return this.httpService
      .get<IpGeolocationRespondedDto>(this.ipGeolocationApiBuilder(ip))
      .pipe(
        map((response) => {
          const { ip, longitude, latitude } = response.data;
          if (response.status !== 200) {
            throw new InternalServerErrorException();
          }

          return IpLocationResponseDto.to(
            ip,
            parseFloat(latitude),
            parseFloat(longitude),
          );
        }),
      );
  }
}
