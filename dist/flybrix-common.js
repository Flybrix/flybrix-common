(function() {
    'use strict';

    angular.module('flybrixCommon', []);
}());

(function () {
    'use strict';
    descriptorsHandler.$inject = [];
    angular.module('flybrixCommon').factory('descriptorsHandler', descriptorsHandler);
    function descriptorsHandler() {
        var versions = {"1.4.0":"1.4.txt","1.5.0":"1.5.txt","1.5.1":"1.5.txt","1.6.0":"1.6.txt","1.7.0":"1.7.txt"};
        var files = {"1.4.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/boot:void,mpu_fail:void,bmp_fail:void,rx_fail:void,idle:void,enabling:void,clear_mpu_bias:void,set_mpu_bias:void,fail_stability:void,fail_angle:void,enabled:void,battery_low:void,temp_warning:void,log_full:void,fail_other:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.5.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/boot:void,mpu_fail:void,bmp_fail:void,rx_fail:void,idle:void,enabling:void,clear_mpu_bias:void,set_mpu_bias:void,fail_stability:void,fail_angle:void,enabled:void,battery_low:void,temp_warning:void,log_full:void,fail_other:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.6.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/_0:void,_1:void,_2:void,no_signal:void,idle:void,arming:void,recording_sd:void,_7:void,loop_slow:void,_9:void,armed:void,battery_low:void,battery_critical:void,log_full:void,crash_detected:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;InertialBias={accel:Vector3f,gyro:Vector3f};VelocityPIDBypass={/8/forward_master:void,right_master:void,up_master:void,_unused_master:void,forward_slave:void,right_slave:void,up_slave:void,_unused_slave:void};VelocityPIDParameters={forward_master:PIDSettings,right_master:PIDSettings,up_master:PIDSettings,forward_slave:PIDSettings,right_slave:PIDSettings,up_slave:PIDSettings,pid_bypass:VelocityPIDBypass};Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.7.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/_0:void,_1:void,_2:void,no_signal:void,idle:void,arming:void,recording_sd:void,_7:void,loop_slow:void,_9:void,armed:void,battery_low:void,battery_critical:void,log_full:void,crash_detected:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;InertialBias={accel:Vector3f,gyro:Vector3f};VelocityPIDBypass={/8/forward_master:void,right_master:void,up_master:void,_unused_master:void,forward_slave:void,right_slave:void,up_slave:void,_unused_slave:void};VelocityPIDParameters={forward_master:PIDSettings,right_master:PIDSettings,up_master:PIDSettings,forward_slave:PIDSettings,right_slave:PIDSettings,up_slave:PIDSettings,pid_bypass:VelocityPIDBypass};Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right_front:Color,color_left_front:Color,color_right_back:Color,color_left_back:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};"};
        return { versions: versions, files: files };
    }
}());
(function() {
    'use strict';

    angular.module('flybrixCommon').factory('calibration', calibration);

    calibration.$inject = ['commandLog', 'serial'];

    function calibration(commandLog, serial) {
        return {
            magnetometer: magnetometer,
            accelerometer: {
                flat: calibrateAccelerometer.bind(null, 'flat', 0),
                forward: calibrateAccelerometer.bind(null, 'lean forward', 1),
                back: calibrateAccelerometer.bind(null, 'lean back', 2),
                right: calibrateAccelerometer.bind(null, 'lean right', 3),
                left: calibrateAccelerometer.bind(null, 'lean left', 4),
            },
            finish: finish,
        };

        function magnetometer() {
            commandLog("Calibrating magnetometer bias");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: 0,
                },
            }, false);
        }

        function calibrateAccelerometer(poseDescription, poseId) {
            commandLog("Calibrating gravity for pose: " + poseDescription);
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: poseId + 1,
                },
            }, false);
        }

        function finish() {
            commandLog("Finishing calibration");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: false,
                    mode: 0,
                },
            }, false);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('cobs', cobs);

    function cobs() {
        return {
            Reader: Reader,
            encode: encode,
        };
    }


    function Reader(capacity) {
        if (capacity === undefined) {
            capacity = 2000;
        }
        this.N = capacity;
        this.buffer = new Uint8Array(capacity);
        this.ready_for_new_message = true;
        this.buffer_length = 0;
    }

    function cobsDecode(reader) {
        var src_ptr = 0;
        var dst_ptr = 0;
        var leftover_length = 0;
        var append_zero = false;
        while (reader.buffer[src_ptr]) {
            if (!leftover_length) {
                if (append_zero)
                    reader.buffer[dst_ptr++] = 0;
                leftover_length = reader.buffer[src_ptr++] - 1;
                append_zero = leftover_length < 0xFE;
            } else {
                --leftover_length;
                reader.buffer[dst_ptr++] = reader.buffer[src_ptr++];
            }
        }

        return leftover_length ? 0 : dst_ptr;
    }

    Reader.prototype.readBytes = function(data, onSuccess, onError) {
        for (var i = 0; i < data.length; i++) {
            var c = data[i];
            if (this.ready_for_new_message) {
                // first byte of a new message
                this.ready_for_new_message = false;
                this.buffer_length = 0;
            }

            this.buffer[this.buffer_length++] = c;

            if (c) {
                if (this.buffer_length === this.N) {
                    // buffer overflow, probably due to errors in data
                    onError('overflow', 'buffer overflow in COBS decoding');
                    this.ready_for_new_message = true;
                }
                continue;
            }

            this.buffer_length = cobsDecode(this);
            var failed_decode = (this.buffer_length === 0);
            if (failed_decode) {
                this.buffer[0] = 1;
            }
            var j;
            for (j = 1; j < this.buffer_length; ++j) {
                this.buffer[0] ^= this.buffer[j];
            }
            if (this.buffer[0] === 0) {  // check sum is correct
                this.ready_for_new_message = true;
                if (this.buffer_length > 0) {
                    onSuccess(this.buffer.slice(1, this.buffer_length));
                } else {
                    onError('short', 'Too short packet');
                }
            } else {  // bad checksum
                this.ready_for_new_message = true;
                var bytes = "";
                var message = "";
                for (j = 0; j < this.buffer_length; j++) {
                    bytes += this.buffer[j] + ",";
                    message += String.fromCharCode(this.buffer[j]);
                }
                if (failed_decode) {
                    onError('frame', 'Unexpected ending of packet');
                } else {
                    var msg = 'BAD CHECKSUM (' + this.buffer_length +
                        ' bytes)' + bytes + message;
                    onError('checksum', msg);
                }
            }
        }
    };

    function encode(buf) {
        var retval =
            new Uint8Array(Math.floor((buf.byteLength * 255 + 761) / 254));
        var len = 1;
        var pos_ctr = 0;
        for (var i = 0; i < buf.length; ++i) {
            if (retval[pos_ctr] == 0xFE) {
                retval[pos_ctr] = 0xFF;
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
            var val = buf[i];
            ++retval[pos_ctr];
            if (val) {
                retval[len++] = val;
            } else {
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
        }
        return retval.subarray(0, len).slice().buffer;
    };
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('commandLog', commandLog);

    commandLog.$inject = ['$q'];

    function commandLog($q) {
        var messages = [];
        var responder = $q.defer();

        var service = log;
        service.log = log;
        service.clearSubscribers = clearSubscribers;
        service.onMessage = onMessage;
        service.read = read;

        return service;

        function log(message) {
            if (message !== undefined) {
                messages.push(message);
                responder.notify(read());
            }
        }

        function read() {
            return messages;
        }

        function clearSubscribers() {
            responder = $q.defer();
        }

        function onMessage(callback) {
            return responder.promise.then(undefined, undefined, callback);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfig', deviceConfig);

    deviceConfig.$inject = ['serial', 'commandLog', 'firmwareVersion', 'serializationHandler'];

    function deviceConfig(serial, commandLog, firmwareVersion, serializationHandler) {
        var config;

        var configCallback = function() {
            commandLog('No callback defined for receiving configurations!');
        };

        var loggingCallback = function() {
            commandLog(
                'No callback defined for receiving logging state!' +
                ' Callback arguments: (isLogging, isLocked, delay)');
        };

        serial.addOnReceiveCallback(function(messageType, message) {
            if (messageType !== 'Command') {
                return;
            }
            if ('set_eeprom_data' in message) {
                updateConfigFromRemoteData(message.set_eeprom_data);
            }
            if ('set_partial_eeprom_data' in message) {
                updateConfigFromRemoteData(message.set_partial_eeprom_data);
            }
            if (('set_card_recording_state' in message) && ('set_sd_write_delay' in message)) {
                var card_rec_state = message.set_card_recording_state;
                var sd_write_delay = message.set_sd_write_delay;
                loggingCallback(card_rec_state.record_to_card, card_rec_state.lock_recording_state, sd_write_delay);
            }
        });

        function getDesiredVersion() {
            return firmwareVersion.desired();
        }


        function request() {
            var handlers = firmwareVersion.serializationHandler();
            commandLog('Requesting current configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: handlers.ConfigurationFlag.empty(),
            }, false);
        }

        function reinit() {
            commandLog('Setting factory default configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                reinit_eeprom_data: true,
            }, false)
                .then(
                    function() {
                        return request();
                    },
                    function(reason) {
                        commandLog(
                            'Request for factory reset failed: ' + reason);
                    });
        }

        function send(newConfig) {
            return sendConfig({ config: newConfig, temporary: false, requestUpdate: true });
        }

        function sendConfig(properties) {
            var handlers = firmwareVersion.serializationHandler();
            var mask = properties.mask || handlers.ConfigurationFlag.empty();
            var newConfig = properties.config || config;
            var requestUpdate = properties.requestUpdate || false;
            var message = {
                request_response: true,
            };
            if (properties.temporary) {
                message.set_partial_temporary_config = newConfig;
                mask = { set_partial_temporary_config: mask };
            } else {
                message.set_partial_eeprom_data = newConfig;
                mask = { set_partial_eeprom_data: mask };
            }
            return serial.sendStructure('Command', message, true, mask).then(function() {
                if (requestUpdate) {
                    request();
                }
            });
        }

        function updateConfigFromRemoteData(configChanges) {
            //commandLog('Received config!');
            config = serializationHandler.updateFields(config, configChanges);
            var version = [config.version.major, config.version.minor, config.version.patch];
            firmwareVersion.set(version);
            if (!firmwareVersion.supported()) {
                commandLog('Received an unsupported configuration!');
                commandLog(
                    'Found version: ' + version[0] + '.' + version[1] + '.' + version[2]  +
                    ' --- Newest version: ' +
                    firmwareVersion.desiredKey() );
            } else {
                commandLog(
                    'Received configuration data (v' +
                    version[0] + '.' + version[1] + '.' + version[2] +')');
                configCallback();
            }
        }

        function setConfigCallback(callback) {
            configCallback = callback;
        }

        function setLoggingCallback(callback) {
            loggingCallback = callback;
        }

        function getConfig() {
            return config;
        }

        config = firmwareVersion.serializationHandler().Configuration.empty();

        return {
            request: request,
            reinit: reinit,
            send: send,
            sendConfig: sendConfig,
            getConfig: getConfig,
            setConfigCallback: setConfigCallback,
            setLoggingCallback: setLoggingCallback,
            getDesiredVersion: getDesiredVersion,
        };
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('firmwareVersion', firmwareVersion);

    firmwareVersion.$inject = ['serializationHandler'];

    function firmwareVersion(serializationHandler) {
        var version = [0, 0, 0];
        var key = '0.0.0';

        var newestVersion = serializationHandler.getNewestVersion();

        var desired = [newestVersion.major, newestVersion.minor, newestVersion.patch];
        var desiredKey = desired[0].toString() + '.' + desired[1].toString() + '.' + desired[2].toString();

        var defaultSerializationHandler = serializationHandler.getHandler(desiredKey);
        var currentSerializationHandler = defaultSerializationHandler;

        return {
            set: function(value) {
                version = value;
                key = value.join('.');
                currentSerializationHandler =
                    serializationHandler.getHandler(desiredKey) || defaultSerializationHandler;
            },
            get: function() {
                return version;
            },
            key: function() {
                return key;
            },
            supported: function() {
                return !!serializationHandler.getHandler(key);
            },
            desired: function() {
                return desired;
            },
            desiredKey: function() {
                return desiredKey;
            },
            serializationHandler: function() {
                return currentSerializationHandler;
            },
        };
    }

}());

(function () {
    'use strict';

    angular.module('flybrixCommon').factory('led', led);

    led.$inject = ['$q', 'serial'];

    function led($q, serial) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var urgent = false;
        var black = {red: 0, green: 0, blue: 0};

        function set(right_front, right_back, left_front, left_back, pattern, red, green) {
            if (!urgent && serial.busy()) {
                return $q.reject('Serial connection is too busy');
            }
            urgent = false;

            pattern = pattern || LedPatterns.NO_OVERRIDE;
            if (pattern < 0) {
                pattern = LedPatterns.NO_OVERRIDE;
            } else if (pattern > 5) {
                pattern = LedPatterns.SOLID;
            }

            var setter_command = {
                pattern: pattern,
                color_right: right_front || black,
                color_left: left_front || black,
                color_right_front: right_front || black,
                color_left_front: left_front || black,
                color_right_back: right_back || black,
                color_left_back: left_back || black,
                indicator_red: red,
                indicator_green: green,
            };

            return serial.sendStructure('Command', {
                request_response: true,
                set_led: setter_command,
            }, false);
        }

        function setSimple(red, green, blue) {
            var color = {red: red || 0, green: green || 0, blue: blue || 0};
            return set(color, color, color, color, LedPatterns.SOLID);
        }

        function clear() {
            forceNextSend();
            return set();
        }

        function forceNextSend() {
            urgent = true;
        }

        return {
            set: set,
            setSimple: setSimple,
            clear: clear,
            patterns: LedPatterns,
            forceNextSend: forceNextSend,
        };
    }

}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('rcData', rcData);

    rcData.$inject = ['serial'];

    function rcData(serial) {
        var AUX = {
            LOW: 0,
            MID: 1,
            HIGH: 2,
        };
        var auxNames = ['low', 'mid', 'high'];

        var throttle = -1;
        var pitch = 0;
        var roll = 0;
        var yaw = 0;
        // defaults to high -- low is enabling; high is disabling
        var aux1 = AUX.HIGH;
        // defaults to ?? -- need to check transmitter behavior
        var aux2 = AUX.HIGH;

        var urgent = true;

        return {
            setThrottle: setThrottle,
            setPitch: setPitch,
            setRoll: setRoll,
            setYaw: setYaw,
            setAux1: setAux1,
            setAux2: setAux2,
            getThrottle: getThrottle,
            getPitch: getPitch,
            getRoll: getRoll,
            getYaw: getYaw,
            getAux1: getAux1,
            getAux2: getAux2,
            AUX: AUX,
            send: send,
            forceNextSend: forceNextSend,
        };

        function send() {
            if (!urgent && serial.busy()) {
                return;
            }
            urgent = false;

            var command = {};

            // invert pitch and roll
            var throttle_threshold =
                -0.8;  // keep bottom 10% of throttle stick to mean 'off'
            command.throttle = constrain(
                (throttle - throttle_threshold) * 4095 /
                    (1 - throttle_threshold),
                0, 4095);
            command.pitch =
                constrain(-(applyDeadzone(pitch, 0.1)) * 4095 / 2, -2047, 2047);
            command.roll =
                constrain((applyDeadzone(roll, 0.1)) * 4095 / 2, -2047, 2047);
            command.yaw =
                constrain(-(applyDeadzone(yaw, 0.1)) * 4095 / 2, -2047, 2047);

            var aux_mask = {};
            // aux1_low, aux1_mid, aux1_high, and same with aux2
            aux_mask['aux1_' + auxNames[aux1]] = true;
            aux_mask['aux2_' + auxNames[aux2]] = true;

            return serial.sendStructure('Command', {
                request_response: true,
                set_serial_rc: {
                    enabled: true,
                    command: command,
                    aux_mask: aux_mask,
                },
            }, false);
        }

        function setThrottle(v) {
            throttle = v;
        }

        function setPitch(v) {
            pitch = v;
        }

        function setRoll(v) {
            roll = v;
        }

        function setYaw(v) {
            yaw = v;
        }

        function setAux1(v) {
            aux1 = Math.max(0, Math.min(2, v));
        }

        function setAux2(v) {
            aux2 = Math.max(0, Math.min(2, v));
        }

        function getThrottle() {
            return throttle;
        }

        function getPitch() {
            return pitch;
        }

        function getRoll() {
            return roll;
        }

        function getYaw() {
            return yaw;
        }

        function getAux1() {
            return aux1;
        }

        function getAux2() {
            return aux2;
        }

        function forceNextSend() {
            urgent = true;
        }

        function constrain(x, xmin, xmax) {
            return Math.max(xmin, Math.min(x, xmax));
        }

        function applyDeadzone(value, deadzone) {
            if (value > deadzone) {
                return value - deadzone;
            }
            if (value < -deadzone) {
                return value + deadzone;
            }
            return 0;
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['$timeout', '$q', 'cobs', 'commandLog', 'firmwareVersion', 'serializationHandler'];

    function serial($timeout, $q, cobs, commandLog, firmwareVersion, serializationHandler) {
        var MessageType = {
            State: 0,
            Command: 1,
            DebugString: 3,
            HistoryData: 4,
            Protocol: 128,
            Response: 255,
        };

        var acknowledges = [];
        var backend = new Backend();

        var onReceiveListeners = [];

        var cobsReader = new cobs.Reader(10000);
        var bytesHandler = undefined;

        function Backend() {
        }

        Backend.prototype.busy = function() {
            return false;
        };

        Backend.prototype.send = function(data) {
            commandLog('No "send" defined for serial backend');
        };

        Backend.prototype.onRead = function(data) {
            commandLog('No "onRead" defined for serial backend');
        };

        var MessageTypeInversion = [];
        Object.keys(MessageType).forEach(function(key) {
            MessageTypeInversion[MessageType[key]] = key;
        });

        addOnReceiveCallback(function(messageType, message) {
            if (messageType === 'Response') {
                acknowledge(message.mask, message.ack);
            } else if (messageType === 'Protocol') {
                var data = message.response;
                if (data) {
                    serializationHandler.addHandler(data.version, data.structure);
                }
            }
        });

        return {
            busy: busy,
            sendStructure: sendStructure,
            setBackend: setBackend,
            addOnReceiveCallback: addOnReceiveCallback,
            removeOnReceiveCallback: removeOnReceiveCallback,
            setBytesHandler: setBytesHandler,
            handlePostConnect: handlePostConnect,
            Backend: Backend,
        };

        function setBackend(v) {
            backend = v;
            backend.onRead = read;
        }

        function handlePostConnect() {
            return requestFirmwareVersion();
        }

        function requestFirmwareVersion() {
            return sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: {
                    version: true,
                },
            });
        }

        function sendStructure(messageType, data, log_send, extraMask) {
            if (messageType === 'State') {
                data = processStateOutput(data);
            }
            var handlers = firmwareVersion.serializationHandler();

            var response = $q.defer();
            if (!(messageType in MessageType)) {
                response.reject('Message type "' + messageType +
                    '" not supported by app, supported message types are:' +
                    Object.keys(MessageType).join(', '));
                return response.promise;
            }
            if (!(messageType in handlers)) {
                response.reject('Message type "' + messageType +
                    '" not supported by firmware, supported message types are:' +
                    Object.keys(handlers).join(', '));
                return response.promise;
            }
            var typeCode = MessageType[messageType];
            var handler = handlers[messageType];

            var buffer = new Uint8Array(handler.byteCount);

            var serializer = new serializationHandler.Serializer(new DataView(buffer.buffer));
            handler.encode(serializer, data, extraMask);
            var mask = handler.maskArray(data, extraMask);
            if (mask.length < 5) {
                mask = (mask[0] << 0) | (mask[1] << 8) | (mask[2] << 16) | (mask[3] << 24);
            }

            var dataLength = serializer.index;

            var output = new Uint8Array(dataLength + 3);
            output[0] = output[1] = typeCode;
            for (var idx = 0; idx < dataLength; ++idx) {
                output[0] ^= output[idx + 2] = buffer[idx];
            }
            output[dataLength + 2] = 0;

            acknowledges.push({
                mask: mask,
                response: response,
            });

            $timeout(function() {
                backend.send(new Uint8Array(cobs.encode(output)));
            }, 0);

            if (log_send) {
                commandLog('Sending command ' + typeCode);
            }

            return response.promise;
        }

        function busy() {
            return backend.busy();
        }

        function setBytesHandler(handler) {
            bytesHandler = handler;
        }

        function read(data) {
            if (bytesHandler)
                bytesHandler(data, processData);
            else
                cobsReader.readBytes(data, processData, reportIssues);
        }

        function reportIssues(issue, text) {
            commandLog('COBS decoding failed (' + issue + '): ' + text);
        }

        function addOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.concat([callback]);
        }

        function removeOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.filter(function(cb) {
                return cb !== callback;
            });
        }

        function acknowledge(mask, value) {
            while (acknowledges.length > 0) {
                var v = acknowledges.shift();
                if (v.mask ^ mask) {
                    v.response.reject('Missing ACK');
                    continue;
                }
                var relaxedMask = mask;
                relaxedMask &= ~1;
                if (relaxedMask ^ value) {
                    v.response.reject('Request was not fully processed');
                    break;
                }
                v.response.resolve();
                break;
            }
        }

        function processData(bytes) {
            var messageType = MessageTypeInversion[bytes[0]];
            var handler = firmwareVersion.serializationHandler()[messageType];
            if (!messageType || !handler) {
                commandLog('Illegal message type passed from firmware');
                return;
            }
            try {
                var serializer = new serializationHandler.Serializer(new DataView(bytes.buffer, 1));
                var message = handler.decode(serializer);
            } catch (err) {
                commandLog('Unrecognized message format received');
            }
            if (messageType === 'State') {
                message = processStateInput(message);
            }
            onReceiveListeners.forEach(function(listener) {
                listener(messageType, message);
            });
        }

        var last_timestamp_us = 0;

        function processStateInput(state) {
            state = Object.assign({}, state);
            var serial_update_rate_Hz = 0;

            if ('timestamp_us' in state) {
                state.serial_update_rate_estimate = 1000000 / (state.timestamp_us - last_timestamp_us);
                last_timestamp_us = state.timestamp_us;
            }
            if ('temperature' in state) {
                state.temperature /= 100.0;  // temperature given in Celsius * 100
            }
            if ('pressure' in state) {
                state.pressure /= 256.0;  // pressure given in (Q24.8) format
            }

            return state;
        }

        function processStateOutput(state) {
            state = Object.assign({}, state);
            if ('temperature' in state) {
                state.temperature *= 100.0;
            }
            if ('pressure' in state) {
                state.pressure *= 256.0;
            }
            return state;
        }
    }
}());

(function () {
    'use strict';

    serializationHandler.$inject = ['descriptorsHandler'];

    angular.module('flybrixCommon').factory('serializationHandler', serializationHandler);

    function serializationHandler(descriptorsHandler) {
        var handlerCache = {};

        var newestVersion = { major: 0, minor: 0, patch: 0 };

        function isNewerVersion(version) {
            if (version.major !== newestVersion.major) {
                return version.major > newestVersion.major;
            }
            if (version.minor !== newestVersion.minor) {
                return version.minor > newestVersion.minor;
            }
            return version.patch > newestVersion.patch;
        }

        function versionToString(version) {
            return version.major.toString() + '.' + version.minor.toString() + '.' + version.patch.toString();
        }

        function stringToVersion(version) {
            var parts = version.split('.');
            return {
                major: parseInt(parts[0]),
                minor: parseInt(parts[1]),
                patch: parseInt(parts[2]),
            };
        }

        function addHandler(version, structure) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            handlerCache[versionToString(version)] = FlybrixSerialization.parse(structure);
        }

        function copyHandler(version, srcVersion) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            handlerCache[versionToString(version)] = handlerCache[versionToString(srcVersion)];
        }

        var descVersions = descriptorsHandler.versions;
        var descFiles = descriptorsHandler.files;
        var descReverseMap = {};
        Object.keys(descVersions).forEach(function(key) {
            var vers = stringToVersion(key);
            var filename = descVersions[key];
            if (filename in descReverseMap) {
                copyHandler(vers, descReverseMap[filename])
            } else {
                filename = descVersions[key];
                addHandler(vers, descFiles[filename]);
                descReverseMap[filename] = vers;
            }
        });

        function updateFields(target, source) {
            if (source instanceof Array) {
                return updateFieldsArray(target, source);
            } else if (source instanceof Object) {
                return updateFieldsObject(target, source);
            } else {
                return (source === null || source === undefined) ? target : source;
            }
        }

        function updateFieldsObject(target, source) {
            var result = {};
            Object.keys(target).forEach(function (key) {
                result[key] = updateFields(target[key], source[key]);
            });
            Object.keys(source).forEach(function (key) {
                if (key in result) {
                    return;
                }
                result[key] = updateFields(target[key], source[key]);
            });
            return result;
        }

        function updateFieldsArray(target, source) {
            var length = Math.max(target.length, source.length);
            var result = [];
            for (var idx = 0; idx < length; ++idx) {
                result.push(updateFields(target[idx], source[idx]));
            }
            return result;
        }

        return {
            Serializer: FlybrixSerialization.Serializer,
            getHandler: function (firmware) {
                return handlerCache[firmware];
            },
            getNewestVersion: function () {
                return newestVersion;
            },
            addHandler: addHandler,
            copyHandler: copyHandler,
            updateFields: updateFields,
        };
    }

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImRlc2NyaXB0b3JzLmpzIiwiY2FsaWJyYXRpb24uanMiLCJjb2JzLmpzIiwiY29tbWFuZExvZy5qcyIsImRldmljZUNvbmZpZy5qcyIsImZpcm13YXJlVmVyc2lvbi5qcyIsImxlZC5qcyIsInJjRGF0YS5qcyIsInNlcmlhbC5qcyIsInNlcmlhbGl6YXRpb25IYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZmx5YnJpeC1jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nLCBbXSk7XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGRlc2NyaXB0b3JzSGFuZGxlci4kaW5qZWN0ID0gW107XG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdkZXNjcmlwdG9yc0hhbmRsZXInLCBkZXNjcmlwdG9yc0hhbmRsZXIpO1xuICAgIGZ1bmN0aW9uIGRlc2NyaXB0b3JzSGFuZGxlcigpIHtcbiAgICAgICAgdmFyIHZlcnNpb25zID0ge1wiMS40LjBcIjpcIjEuNC50eHRcIixcIjEuNS4wXCI6XCIxLjUudHh0XCIsXCIxLjUuMVwiOlwiMS41LnR4dFwiLFwiMS42LjBcIjpcIjEuNi50eHRcIixcIjEuNy4wXCI6XCIxLjcudHh0XCJ9O1xuICAgICAgICB2YXIgZmlsZXMgPSB7XCIxLjQudHh0XCI6XCJWZWN0b3IzZj17eDpmMzIseTpmMzIsejpmMzJ9O1BJRFNldHRpbmdzPXtrcDpmMzIsa2k6ZjMyLGtkOmYzMixpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6ZjMyLGRfZmlsdGVyX3RpbWU6ZjMyLHNldHBvaW50X2ZpbHRlcl90aW1lOmYzMixjb21tYW5kX3RvX3ZhbHVlOmYzMn07VmVyc2lvbj17bWFqb3I6dTgsbWlub3I6dTgscGF0Y2g6dTh9O0NvbmZpZ0lEPXUzMjtQY2JUcmFuc2Zvcm09e29yaWVudGF0aW9uOlZlY3RvcjNmLHRyYW5zbGF0aW9uOlZlY3RvcjNmfTtNaXhUYWJsZT17Zno6W2k4OjhdLHR4OltpODo4XSx0eTpbaTg6OF0sdHo6W2k4OjhdfTtNYWdCaWFzPXtvZmZzZXQ6VmVjdG9yM2Z9O0NoYW5uZWxQcm9wZXJ0aWVzPXthc3NpZ25tZW50Ont0aHJ1c3Q6dTgscGl0Y2g6dTgscm9sbDp1OCx5YXc6dTgsYXV4MTp1OCxhdXgyOnU4fSxpbnZlcnNpb246ey84L3RocnVzdDp2b2lkLHBpdGNoOnZvaWQscm9sbDp2b2lkLHlhdzp2b2lkLGF1eDE6dm9pZCxhdXgyOnZvaWR9LG1pZHBvaW50Olt1MTY6Nl0sZGVhZHpvbmU6W3UxNjo2XX07UElEQnlwYXNzPXsvOC90aHJ1c3RfbWFzdGVyOnZvaWQscGl0Y2hfbWFzdGVyOnZvaWQscm9sbF9tYXN0ZXI6dm9pZCx5YXdfbWFzdGVyOnZvaWQsdGhydXN0X3NsYXZlOnZvaWQscGl0Y2hfc2xhdmU6dm9pZCxyb2xsX3NsYXZlOnZvaWQseWF3X3NsYXZlOnZvaWR9O1BJRFBhcmFtZXRlcnM9e3RocnVzdF9tYXN0ZXI6UElEU2V0dGluZ3MscGl0Y2hfbWFzdGVyOlBJRFNldHRpbmdzLHJvbGxfbWFzdGVyOlBJRFNldHRpbmdzLHlhd19tYXN0ZXI6UElEU2V0dGluZ3MsdGhydXN0X3NsYXZlOlBJRFNldHRpbmdzLHBpdGNoX3NsYXZlOlBJRFNldHRpbmdzLHJvbGxfc2xhdmU6UElEU2V0dGluZ3MseWF3X3NsYXZlOlBJRFNldHRpbmdzLHBpZF9ieXBhc3M6UElEQnlwYXNzfTtTdGF0ZVBhcmFtZXRlcnM9e3N0YXRlX2VzdGltYXRpb246W2YzMjoyXSxlbmFibGU6W2YzMjoyXX07U3RhdHVzRmxhZz17LzE2L2Jvb3Q6dm9pZCxtcHVfZmFpbDp2b2lkLGJtcF9mYWlsOnZvaWQscnhfZmFpbDp2b2lkLGlkbGU6dm9pZCxlbmFibGluZzp2b2lkLGNsZWFyX21wdV9iaWFzOnZvaWQsc2V0X21wdV9iaWFzOnZvaWQsZmFpbF9zdGFiaWxpdHk6dm9pZCxmYWlsX2FuZ2xlOnZvaWQsZW5hYmxlZDp2b2lkLGJhdHRlcnlfbG93OnZvaWQsdGVtcF93YXJuaW5nOnZvaWQsbG9nX2Z1bGw6dm9pZCxmYWlsX290aGVyOnZvaWQsb3ZlcnJpZGU6dm9pZH07Q29sb3I9e3JlZDp1OCxncmVlbjp1OCxibHVlOnU4fTtMRURTdGF0ZUNvbG9ycz17cmlnaHRfZnJvbnQ6Q29sb3IscmlnaHRfYmFjazpDb2xvcixsZWZ0X2Zyb250OkNvbG9yLGxlZnRfYmFjazpDb2xvcn07TEVEU3RhdGVDYXNlPXtzdGF0dXM6U3RhdHVzRmxhZyxwYXR0ZXJuOnU4LGNvbG9yczpMRURTdGF0ZUNvbG9ycyxpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9O0xFRFN0YXRlcz1bLzE2L0xFRFN0YXRlQ2FzZToxNl07TEVEU3RhdGVzRml4ZWQ9W0xFRFN0YXRlQ2FzZToxNl07RGV2aWNlTmFtZT1zOTtDb25maWd1cmF0aW9uPXsvMTYvdmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlcyxuYW1lOkRldmljZU5hbWV9O0NvbmZpZ3VyYXRpb25GaXhlZD17dmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlc0ZpeGVkLG5hbWU6RGV2aWNlTmFtZX07Q29uZmlndXJhdGlvbkZsYWc9ey8xNi92ZXJzaW9uOnZvaWQsaWQ6dm9pZCxwY2JfdHJhbnNmb3JtOnZvaWQsbWl4X3RhYmxlOnZvaWQsbWFnX2JpYXM6dm9pZCxjaGFubmVsOnZvaWQscGlkX3BhcmFtZXRlcnM6dm9pZCxzdGF0ZV9wYXJhbWV0ZXJzOnZvaWQsbGVkX3N0YXRlczpbLy92b2lkOjE2XSxuYW1lOnZvaWR9O1JvdGF0aW9uPXtwaXRjaDpmMzIscm9sbDpmMzIseWF3OmYzMn07UElEU3RhdGU9e3RpbWVzdGFtcF91czp1MzIsaW5wdXQ6ZjMyLHNldHBvaW50OmYzMixwX3Rlcm06ZjMyLGlfdGVybTpmMzIsZF90ZXJtOmYzMn07UmNDb21tYW5kPXt0aHJvdHRsZTppMTYscGl0Y2g6aTE2LHJvbGw6aTE2LHlhdzppMTZ9O1N0YXRlPXsvMzIvdGltZXN0YW1wX3VzOnUzMixzdGF0dXM6U3RhdHVzRmxhZyx2MF9yYXc6dTE2LGkwX3Jhdzp1MTYsaTFfcmF3OnUxNixhY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmLG1hZzpWZWN0b3IzZix0ZW1wZXJhdHVyZTp1MTYscHJlc3N1cmU6dTMyLHBwbTpbaTE2OjZdLGF1eF9jaGFuX21hc2s6dTgsY29tbWFuZDpSY0NvbW1hbmQsY29udHJvbDp7Zno6ZjMyLHR4OmYzMix0eTpmMzIsdHo6ZjMyfSxwaWRfbWFzdGVyX2Z6OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHg6UElEU3RhdGUscGlkX21hc3Rlcl90eTpQSURTdGF0ZSxwaWRfbWFzdGVyX3R6OlBJRFN0YXRlLHBpZF9zbGF2ZV9mejpQSURTdGF0ZSxwaWRfc2xhdmVfdHg6UElEU3RhdGUscGlkX3NsYXZlX3R5OlBJRFN0YXRlLHBpZF9zbGF2ZV90ejpQSURTdGF0ZSxtb3Rvcl9vdXQ6W2kxNjo4XSxraW5lbWF0aWNzX2FuZ2xlOlJvdGF0aW9uLGtpbmVtYXRpY3NfcmF0ZTpSb3RhdGlvbixraW5lbWF0aWNzX2FsdGl0dWRlOmYzMixsb29wX2NvdW50OnUzMn07U3RhdGVGaWVsZHM9ey8zMi90aW1lc3RhbXBfdXM6dm9pZCxzdGF0dXM6dm9pZCx2MF9yYXc6dm9pZCxpMF9yYXc6dm9pZCxpMV9yYXc6dm9pZCxhY2NlbDp2b2lkLGd5cm86dm9pZCxtYWc6dm9pZCx0ZW1wZXJhdHVyZTp2b2lkLHByZXNzdXJlOnZvaWQscHBtOnZvaWQsYXV4X2NoYW5fbWFzazp2b2lkLGNvbW1hbmQ6dm9pZCxjb250cm9sOnZvaWQscGlkX21hc3Rlcl9mejp2b2lkLHBpZF9tYXN0ZXJfdHg6dm9pZCxwaWRfbWFzdGVyX3R5OnZvaWQscGlkX21hc3Rlcl90ejp2b2lkLHBpZF9zbGF2ZV9mejp2b2lkLHBpZF9zbGF2ZV90eDp2b2lkLHBpZF9zbGF2ZV90eTp2b2lkLHBpZF9zbGF2ZV90ejp2b2lkLG1vdG9yX291dDp2b2lkLGtpbmVtYXRpY3NfYW5nbGU6dm9pZCxraW5lbWF0aWNzX3JhdGU6dm9pZCxraW5lbWF0aWNzX2FsdGl0dWRlOnZvaWQsbG9vcF9jb3VudDp2b2lkfTtBdXhNYXNrPXsvL2F1eDFfbG93OnZvaWQsYXV4MV9taWQ6dm9pZCxhdXgxX2hpZ2g6dm9pZCxhdXgyX2xvdzp2b2lkLGF1eDJfbWlkOnZvaWQsYXV4Ml9oaWdoOnZvaWR9O0NvbW1hbmQ9ey8zMi9yZXF1ZXN0X3Jlc3BvbnNlOnZvaWQsc2V0X2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GaXhlZCxyZWluaXRfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOnU4LG1vdG9yX292ZXJyaWRlX3NwZWVkXzA6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzE6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzI6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzM6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzQ6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzU6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzY6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzc6dTE2LHNldF9jb21tYW5kX292ZXJyaWRlOmJvb2wsc2V0X3N0YXRlX21hc2s6U3RhdGVGaWVsZHMsc2V0X3N0YXRlX2RlbGF5OnUxNixzZXRfc2Rfd3JpdGVfZGVsYXk6dTE2LHNldF9sZWQ6e3BhdHRlcm46dTgsY29sb3JfcmlnaHQ6Q29sb3IsY29sb3JfbGVmdDpDb2xvcixpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9LHNldF9zZXJpYWxfcmM6e2VuYWJsZWQ6Ym9vbCxjb21tYW5kOlJjQ29tbWFuZCxhdXhfbWFzazpBdXhNYXNrfSxzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU6ey84L3JlY29yZF90b19jYXJkOnZvaWQsbG9ja19yZWNvcmRpbmdfc3RhdGU6dm9pZH0sc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbixyZWluaXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfY2FyZF9yZWNvcmRpbmdfc3RhdGU6dm9pZCxzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOkNvbmZpZ3VyYXRpb24sc2V0X2NvbW1hbmRfc291cmNlczp7Lzgvc2VyaWFsOnZvaWQscmFkaW86dm9pZH0sc2V0X2NhbGlicmF0aW9uOntlbmFibGVkOmJvb2wsbW9kZTp1OH0sc2V0X2F1dG9waWxvdF9lbmFibGVkOmJvb2wsc2V0X3VzYl9tb2RlOnU4fTtEZWJ1Z1N0cmluZz17ZGVwcmVjYXRlZF9tYXNrOnUzMixtZXNzYWdlOnN9O0hpc3RvcnlEYXRhPURlYnVnU3RyaW5nO1Jlc3BvbnNlPXttYXNrOnUzMixhY2s6dTMyfTtcIixcIjEuNS50eHRcIjpcIlZlY3RvcjNmPXt4OmYzMix5OmYzMix6OmYzMn07UElEU2V0dGluZ3M9e2twOmYzMixraTpmMzIsa2Q6ZjMyLGludGVncmFsX3dpbmR1cF9ndWFyZDpmMzIsZF9maWx0ZXJfdGltZTpmMzIsc2V0cG9pbnRfZmlsdGVyX3RpbWU6ZjMyLGNvbW1hbmRfdG9fdmFsdWU6ZjMyfTtWZXJzaW9uPXttYWpvcjp1OCxtaW5vcjp1OCxwYXRjaDp1OH07Q29uZmlnSUQ9dTMyO1BjYlRyYW5zZm9ybT17b3JpZW50YXRpb246VmVjdG9yM2YsdHJhbnNsYXRpb246VmVjdG9yM2Z9O01peFRhYmxlPXtmejpbaTg6OF0sdHg6W2k4OjhdLHR5OltpODo4XSx0ejpbaTg6OF19O01hZ0JpYXM9e29mZnNldDpWZWN0b3IzZn07Q2hhbm5lbFByb3BlcnRpZXM9e2Fzc2lnbm1lbnQ6e3RocnVzdDp1OCxwaXRjaDp1OCxyb2xsOnU4LHlhdzp1OCxhdXgxOnU4LGF1eDI6dTh9LGludmVyc2lvbjp7LzgvdGhydXN0OnZvaWQscGl0Y2g6dm9pZCxyb2xsOnZvaWQseWF3OnZvaWQsYXV4MTp2b2lkLGF1eDI6dm9pZH0sbWlkcG9pbnQ6W3UxNjo2XSxkZWFkem9uZTpbdTE2OjZdfTtQSURCeXBhc3M9ey84L3RocnVzdF9tYXN0ZXI6dm9pZCxwaXRjaF9tYXN0ZXI6dm9pZCxyb2xsX21hc3Rlcjp2b2lkLHlhd19tYXN0ZXI6dm9pZCx0aHJ1c3Rfc2xhdmU6dm9pZCxwaXRjaF9zbGF2ZTp2b2lkLHJvbGxfc2xhdmU6dm9pZCx5YXdfc2xhdmU6dm9pZH07UElEUGFyYW1ldGVycz17dGhydXN0X21hc3RlcjpQSURTZXR0aW5ncyxwaXRjaF9tYXN0ZXI6UElEU2V0dGluZ3Mscm9sbF9tYXN0ZXI6UElEU2V0dGluZ3MseWF3X21hc3RlcjpQSURTZXR0aW5ncyx0aHJ1c3Rfc2xhdmU6UElEU2V0dGluZ3MscGl0Y2hfc2xhdmU6UElEU2V0dGluZ3Mscm9sbF9zbGF2ZTpQSURTZXR0aW5ncyx5YXdfc2xhdmU6UElEU2V0dGluZ3MsdGhydXN0X2dhaW46ZjMyLHBpdGNoX2dhaW46ZjMyLHJvbGxfZ2FpbjpmMzIseWF3X2dhaW46ZjMyLHBpZF9ieXBhc3M6UElEQnlwYXNzfTtTdGF0ZVBhcmFtZXRlcnM9e3N0YXRlX2VzdGltYXRpb246W2YzMjoyXSxlbmFibGU6W2YzMjoyXX07U3RhdHVzRmxhZz17LzE2L2Jvb3Q6dm9pZCxtcHVfZmFpbDp2b2lkLGJtcF9mYWlsOnZvaWQscnhfZmFpbDp2b2lkLGlkbGU6dm9pZCxlbmFibGluZzp2b2lkLGNsZWFyX21wdV9iaWFzOnZvaWQsc2V0X21wdV9iaWFzOnZvaWQsZmFpbF9zdGFiaWxpdHk6dm9pZCxmYWlsX2FuZ2xlOnZvaWQsZW5hYmxlZDp2b2lkLGJhdHRlcnlfbG93OnZvaWQsdGVtcF93YXJuaW5nOnZvaWQsbG9nX2Z1bGw6dm9pZCxmYWlsX290aGVyOnZvaWQsb3ZlcnJpZGU6dm9pZH07Q29sb3I9e3JlZDp1OCxncmVlbjp1OCxibHVlOnU4fTtMRURTdGF0ZUNvbG9ycz17cmlnaHRfZnJvbnQ6Q29sb3IscmlnaHRfYmFjazpDb2xvcixsZWZ0X2Zyb250OkNvbG9yLGxlZnRfYmFjazpDb2xvcn07TEVEU3RhdGVDYXNlPXtzdGF0dXM6U3RhdHVzRmxhZyxwYXR0ZXJuOnU4LGNvbG9yczpMRURTdGF0ZUNvbG9ycyxpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9O0xFRFN0YXRlcz1bLzE2L0xFRFN0YXRlQ2FzZToxNl07TEVEU3RhdGVzRml4ZWQ9W0xFRFN0YXRlQ2FzZToxNl07RGV2aWNlTmFtZT1zOTtDb25maWd1cmF0aW9uPXsvMTYvdmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlcyxuYW1lOkRldmljZU5hbWV9O0NvbmZpZ3VyYXRpb25GaXhlZD17dmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlc0ZpeGVkLG5hbWU6RGV2aWNlTmFtZX07Q29uZmlndXJhdGlvbkZsYWc9ey8xNi92ZXJzaW9uOnZvaWQsaWQ6dm9pZCxwY2JfdHJhbnNmb3JtOnZvaWQsbWl4X3RhYmxlOnZvaWQsbWFnX2JpYXM6dm9pZCxjaGFubmVsOnZvaWQscGlkX3BhcmFtZXRlcnM6dm9pZCxzdGF0ZV9wYXJhbWV0ZXJzOnZvaWQsbGVkX3N0YXRlczpbLy92b2lkOjE2XSxuYW1lOnZvaWQsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6dm9pZCxpbmVydGlhbF9iaWFzOnZvaWR9O1JvdGF0aW9uPXtwaXRjaDpmMzIscm9sbDpmMzIseWF3OmYzMn07UElEU3RhdGU9e3RpbWVzdGFtcF91czp1MzIsaW5wdXQ6ZjMyLHNldHBvaW50OmYzMixwX3Rlcm06ZjMyLGlfdGVybTpmMzIsZF90ZXJtOmYzMn07UmNDb21tYW5kPXt0aHJvdHRsZTppMTYscGl0Y2g6aTE2LHJvbGw6aTE2LHlhdzppMTZ9O1N0YXRlPXsvMzIvdGltZXN0YW1wX3VzOnUzMixzdGF0dXM6U3RhdHVzRmxhZyx2MF9yYXc6dTE2LGkwX3Jhdzp1MTYsaTFfcmF3OnUxNixhY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmLG1hZzpWZWN0b3IzZix0ZW1wZXJhdHVyZTp1MTYscHJlc3N1cmU6dTMyLHBwbTpbaTE2OjZdLGF1eF9jaGFuX21hc2s6dTgsY29tbWFuZDpSY0NvbW1hbmQsY29udHJvbDp7Zno6ZjMyLHR4OmYzMix0eTpmMzIsdHo6ZjMyfSxwaWRfbWFzdGVyX2Z6OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHg6UElEU3RhdGUscGlkX21hc3Rlcl90eTpQSURTdGF0ZSxwaWRfbWFzdGVyX3R6OlBJRFN0YXRlLHBpZF9zbGF2ZV9mejpQSURTdGF0ZSxwaWRfc2xhdmVfdHg6UElEU3RhdGUscGlkX3NsYXZlX3R5OlBJRFN0YXRlLHBpZF9zbGF2ZV90ejpQSURTdGF0ZSxtb3Rvcl9vdXQ6W2kxNjo4XSxraW5lbWF0aWNzX2FuZ2xlOlJvdGF0aW9uLGtpbmVtYXRpY3NfcmF0ZTpSb3RhdGlvbixraW5lbWF0aWNzX2FsdGl0dWRlOmYzMixsb29wX2NvdW50OnUzMn07U3RhdGVGaWVsZHM9ey8zMi90aW1lc3RhbXBfdXM6dm9pZCxzdGF0dXM6dm9pZCx2MF9yYXc6dm9pZCxpMF9yYXc6dm9pZCxpMV9yYXc6dm9pZCxhY2NlbDp2b2lkLGd5cm86dm9pZCxtYWc6dm9pZCx0ZW1wZXJhdHVyZTp2b2lkLHByZXNzdXJlOnZvaWQscHBtOnZvaWQsYXV4X2NoYW5fbWFzazp2b2lkLGNvbW1hbmQ6dm9pZCxjb250cm9sOnZvaWQscGlkX21hc3Rlcl9mejp2b2lkLHBpZF9tYXN0ZXJfdHg6dm9pZCxwaWRfbWFzdGVyX3R5OnZvaWQscGlkX21hc3Rlcl90ejp2b2lkLHBpZF9zbGF2ZV9mejp2b2lkLHBpZF9zbGF2ZV90eDp2b2lkLHBpZF9zbGF2ZV90eTp2b2lkLHBpZF9zbGF2ZV90ejp2b2lkLG1vdG9yX291dDp2b2lkLGtpbmVtYXRpY3NfYW5nbGU6dm9pZCxraW5lbWF0aWNzX3JhdGU6dm9pZCxraW5lbWF0aWNzX2FsdGl0dWRlOnZvaWQsbG9vcF9jb3VudDp2b2lkfTtBdXhNYXNrPXsvL2F1eDFfbG93OnZvaWQsYXV4MV9taWQ6dm9pZCxhdXgxX2hpZ2g6dm9pZCxhdXgyX2xvdzp2b2lkLGF1eDJfbWlkOnZvaWQsYXV4Ml9oaWdoOnZvaWR9O0NvbW1hbmQ9ey8zMi9yZXF1ZXN0X3Jlc3BvbnNlOnZvaWQsc2V0X2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GaXhlZCxyZWluaXRfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOnU4LG1vdG9yX292ZXJyaWRlX3NwZWVkXzA6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzE6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzI6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzM6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzQ6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzU6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzY6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzc6dTE2LHNldF9jb21tYW5kX292ZXJyaWRlOmJvb2wsc2V0X3N0YXRlX21hc2s6U3RhdGVGaWVsZHMsc2V0X3N0YXRlX2RlbGF5OnUxNixzZXRfc2Rfd3JpdGVfZGVsYXk6dTE2LHNldF9sZWQ6e3BhdHRlcm46dTgsY29sb3JfcmlnaHQ6Q29sb3IsY29sb3JfbGVmdDpDb2xvcixpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9LHNldF9zZXJpYWxfcmM6e2VuYWJsZWQ6Ym9vbCxjb21tYW5kOlJjQ29tbWFuZCxhdXhfbWFzazpBdXhNYXNrfSxzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU6ey84L3JlY29yZF90b19jYXJkOnZvaWQsbG9ja19yZWNvcmRpbmdfc3RhdGU6dm9pZH0sc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbixyZWluaXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfY2FyZF9yZWNvcmRpbmdfc3RhdGU6dm9pZCxzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOkNvbmZpZ3VyYXRpb24sc2V0X2NvbW1hbmRfc291cmNlczp7Lzgvc2VyaWFsOnZvaWQscmFkaW86dm9pZH0sc2V0X2NhbGlicmF0aW9uOntlbmFibGVkOmJvb2wsbW9kZTp1OH0sc2V0X2F1dG9waWxvdF9lbmFibGVkOmJvb2wsc2V0X3VzYl9tb2RlOnU4fTtEZWJ1Z1N0cmluZz17ZGVwcmVjYXRlZF9tYXNrOnUzMixtZXNzYWdlOnN9O0hpc3RvcnlEYXRhPURlYnVnU3RyaW5nO1Jlc3BvbnNlPXttYXNrOnUzMixhY2s6dTMyfTtcIixcIjEuNi50eHRcIjpcIlZlY3RvcjNmPXt4OmYzMix5OmYzMix6OmYzMn07UElEU2V0dGluZ3M9e2twOmYzMixraTpmMzIsa2Q6ZjMyLGludGVncmFsX3dpbmR1cF9ndWFyZDpmMzIsZF9maWx0ZXJfdGltZTpmMzIsc2V0cG9pbnRfZmlsdGVyX3RpbWU6ZjMyLGNvbW1hbmRfdG9fdmFsdWU6ZjMyfTtWZXJzaW9uPXttYWpvcjp1OCxtaW5vcjp1OCxwYXRjaDp1OH07Q29uZmlnSUQ9dTMyO1BjYlRyYW5zZm9ybT17b3JpZW50YXRpb246VmVjdG9yM2YsdHJhbnNsYXRpb246VmVjdG9yM2Z9O01peFRhYmxlPXtmejpbaTg6OF0sdHg6W2k4OjhdLHR5OltpODo4XSx0ejpbaTg6OF19O01hZ0JpYXM9e29mZnNldDpWZWN0b3IzZn07Q2hhbm5lbFByb3BlcnRpZXM9e2Fzc2lnbm1lbnQ6e3RocnVzdDp1OCxwaXRjaDp1OCxyb2xsOnU4LHlhdzp1OCxhdXgxOnU4LGF1eDI6dTh9LGludmVyc2lvbjp7LzgvdGhydXN0OnZvaWQscGl0Y2g6dm9pZCxyb2xsOnZvaWQseWF3OnZvaWQsYXV4MTp2b2lkLGF1eDI6dm9pZH0sbWlkcG9pbnQ6W3UxNjo2XSxkZWFkem9uZTpbdTE2OjZdfTtQSURCeXBhc3M9ey84L3RocnVzdF9tYXN0ZXI6dm9pZCxwaXRjaF9tYXN0ZXI6dm9pZCxyb2xsX21hc3Rlcjp2b2lkLHlhd19tYXN0ZXI6dm9pZCx0aHJ1c3Rfc2xhdmU6dm9pZCxwaXRjaF9zbGF2ZTp2b2lkLHJvbGxfc2xhdmU6dm9pZCx5YXdfc2xhdmU6dm9pZH07UElEUGFyYW1ldGVycz17dGhydXN0X21hc3RlcjpQSURTZXR0aW5ncyxwaXRjaF9tYXN0ZXI6UElEU2V0dGluZ3Mscm9sbF9tYXN0ZXI6UElEU2V0dGluZ3MseWF3X21hc3RlcjpQSURTZXR0aW5ncyx0aHJ1c3Rfc2xhdmU6UElEU2V0dGluZ3MscGl0Y2hfc2xhdmU6UElEU2V0dGluZ3Mscm9sbF9zbGF2ZTpQSURTZXR0aW5ncyx5YXdfc2xhdmU6UElEU2V0dGluZ3MsdGhydXN0X2dhaW46ZjMyLHBpdGNoX2dhaW46ZjMyLHJvbGxfZ2FpbjpmMzIseWF3X2dhaW46ZjMyLHBpZF9ieXBhc3M6UElEQnlwYXNzfTtTdGF0ZVBhcmFtZXRlcnM9e3N0YXRlX2VzdGltYXRpb246W2YzMjoyXSxlbmFibGU6W2YzMjoyXX07U3RhdHVzRmxhZz17LzE2L18wOnZvaWQsXzE6dm9pZCxfMjp2b2lkLG5vX3NpZ25hbDp2b2lkLGlkbGU6dm9pZCxhcm1pbmc6dm9pZCxyZWNvcmRpbmdfc2Q6dm9pZCxfNzp2b2lkLGxvb3Bfc2xvdzp2b2lkLF85OnZvaWQsYXJtZWQ6dm9pZCxiYXR0ZXJ5X2xvdzp2b2lkLGJhdHRlcnlfY3JpdGljYWw6dm9pZCxsb2dfZnVsbDp2b2lkLGNyYXNoX2RldGVjdGVkOnZvaWQsb3ZlcnJpZGU6dm9pZH07Q29sb3I9e3JlZDp1OCxncmVlbjp1OCxibHVlOnU4fTtMRURTdGF0ZUNvbG9ycz17cmlnaHRfZnJvbnQ6Q29sb3IscmlnaHRfYmFjazpDb2xvcixsZWZ0X2Zyb250OkNvbG9yLGxlZnRfYmFjazpDb2xvcn07TEVEU3RhdGVDYXNlPXtzdGF0dXM6U3RhdHVzRmxhZyxwYXR0ZXJuOnU4LGNvbG9yczpMRURTdGF0ZUNvbG9ycyxpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9O0xFRFN0YXRlcz1bLzE2L0xFRFN0YXRlQ2FzZToxNl07TEVEU3RhdGVzRml4ZWQ9W0xFRFN0YXRlQ2FzZToxNl07RGV2aWNlTmFtZT1zOTtJbmVydGlhbEJpYXM9e2FjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2Z9O1ZlbG9jaXR5UElEQnlwYXNzPXsvOC9mb3J3YXJkX21hc3Rlcjp2b2lkLHJpZ2h0X21hc3Rlcjp2b2lkLHVwX21hc3Rlcjp2b2lkLF91bnVzZWRfbWFzdGVyOnZvaWQsZm9yd2FyZF9zbGF2ZTp2b2lkLHJpZ2h0X3NsYXZlOnZvaWQsdXBfc2xhdmU6dm9pZCxfdW51c2VkX3NsYXZlOnZvaWR9O1ZlbG9jaXR5UElEUGFyYW1ldGVycz17Zm9yd2FyZF9tYXN0ZXI6UElEU2V0dGluZ3MscmlnaHRfbWFzdGVyOlBJRFNldHRpbmdzLHVwX21hc3RlcjpQSURTZXR0aW5ncyxmb3J3YXJkX3NsYXZlOlBJRFNldHRpbmdzLHJpZ2h0X3NsYXZlOlBJRFNldHRpbmdzLHVwX3NsYXZlOlBJRFNldHRpbmdzLHBpZF9ieXBhc3M6VmVsb2NpdHlQSURCeXBhc3N9O0NvbmZpZ3VyYXRpb249ey8xNi92ZXJzaW9uOlZlcnNpb24saWQ6Q29uZmlnSUQscGNiX3RyYW5zZm9ybTpQY2JUcmFuc2Zvcm0sbWl4X3RhYmxlOk1peFRhYmxlLG1hZ19iaWFzOk1hZ0JpYXMsY2hhbm5lbDpDaGFubmVsUHJvcGVydGllcyxwaWRfcGFyYW1ldGVyczpQSURQYXJhbWV0ZXJzLHN0YXRlX3BhcmFtZXRlcnM6U3RhdGVQYXJhbWV0ZXJzLGxlZF9zdGF0ZXM6TEVEU3RhdGVzLG5hbWU6RGV2aWNlTmFtZSx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczpWZWxvY2l0eVBJRFBhcmFtZXRlcnMsaW5lcnRpYWxfYmlhczpJbmVydGlhbEJpYXN9O0NvbmZpZ3VyYXRpb25GaXhlZD17dmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlc0ZpeGVkLG5hbWU6RGV2aWNlTmFtZSx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczpWZWxvY2l0eVBJRFBhcmFtZXRlcnMsaW5lcnRpYWxfYmlhczpJbmVydGlhbEJpYXN9O0NvbmZpZ3VyYXRpb25GbGFnPXsvMTYvdmVyc2lvbjp2b2lkLGlkOnZvaWQscGNiX3RyYW5zZm9ybTp2b2lkLG1peF90YWJsZTp2b2lkLG1hZ19iaWFzOnZvaWQsY2hhbm5lbDp2b2lkLHBpZF9wYXJhbWV0ZXJzOnZvaWQsc3RhdGVfcGFyYW1ldGVyczp2b2lkLGxlZF9zdGF0ZXM6Wy8vdm9pZDoxNl0sbmFtZTp2b2lkLHZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOnZvaWQsaW5lcnRpYWxfYmlhczp2b2lkfTtSb3RhdGlvbj17cGl0Y2g6ZjMyLHJvbGw6ZjMyLHlhdzpmMzJ9O1BJRFN0YXRlPXt0aW1lc3RhbXBfdXM6dTMyLGlucHV0OmYzMixzZXRwb2ludDpmMzIscF90ZXJtOmYzMixpX3Rlcm06ZjMyLGRfdGVybTpmMzJ9O1JjQ29tbWFuZD17dGhyb3R0bGU6aTE2LHBpdGNoOmkxNixyb2xsOmkxNix5YXc6aTE2fTtTdGF0ZT17LzMyL3RpbWVzdGFtcF91czp1MzIsc3RhdHVzOlN0YXR1c0ZsYWcsdjBfcmF3OnUxNixpMF9yYXc6dTE2LGkxX3Jhdzp1MTYsYWNjZWw6VmVjdG9yM2YsZ3lybzpWZWN0b3IzZixtYWc6VmVjdG9yM2YsdGVtcGVyYXR1cmU6dTE2LHByZXNzdXJlOnUzMixwcG06W2kxNjo2XSxhdXhfY2hhbl9tYXNrOnU4LGNvbW1hbmQ6UmNDb21tYW5kLGNvbnRyb2w6e2Z6OmYzMix0eDpmMzIsdHk6ZjMyLHR6OmYzMn0scGlkX21hc3Rlcl9mejpQSURTdGF0ZSxwaWRfbWFzdGVyX3R4OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHk6UElEU3RhdGUscGlkX21hc3Rlcl90ejpQSURTdGF0ZSxwaWRfc2xhdmVfZno6UElEU3RhdGUscGlkX3NsYXZlX3R4OlBJRFN0YXRlLHBpZF9zbGF2ZV90eTpQSURTdGF0ZSxwaWRfc2xhdmVfdHo6UElEU3RhdGUsbW90b3Jfb3V0OltpMTY6OF0sa2luZW1hdGljc19hbmdsZTpSb3RhdGlvbixraW5lbWF0aWNzX3JhdGU6Um90YXRpb24sa2luZW1hdGljc19hbHRpdHVkZTpmMzIsbG9vcF9jb3VudDp1MzJ9O1N0YXRlRmllbGRzPXsvMzIvdGltZXN0YW1wX3VzOnZvaWQsc3RhdHVzOnZvaWQsdjBfcmF3OnZvaWQsaTBfcmF3OnZvaWQsaTFfcmF3OnZvaWQsYWNjZWw6dm9pZCxneXJvOnZvaWQsbWFnOnZvaWQsdGVtcGVyYXR1cmU6dm9pZCxwcmVzc3VyZTp2b2lkLHBwbTp2b2lkLGF1eF9jaGFuX21hc2s6dm9pZCxjb21tYW5kOnZvaWQsY29udHJvbDp2b2lkLHBpZF9tYXN0ZXJfZno6dm9pZCxwaWRfbWFzdGVyX3R4OnZvaWQscGlkX21hc3Rlcl90eTp2b2lkLHBpZF9tYXN0ZXJfdHo6dm9pZCxwaWRfc2xhdmVfZno6dm9pZCxwaWRfc2xhdmVfdHg6dm9pZCxwaWRfc2xhdmVfdHk6dm9pZCxwaWRfc2xhdmVfdHo6dm9pZCxtb3Rvcl9vdXQ6dm9pZCxraW5lbWF0aWNzX2FuZ2xlOnZvaWQsa2luZW1hdGljc19yYXRlOnZvaWQsa2luZW1hdGljc19hbHRpdHVkZTp2b2lkLGxvb3BfY291bnQ6dm9pZH07QXV4TWFzaz17Ly9hdXgxX2xvdzp2b2lkLGF1eDFfbWlkOnZvaWQsYXV4MV9oaWdoOnZvaWQsYXV4Ml9sb3c6dm9pZCxhdXgyX21pZDp2b2lkLGF1eDJfaGlnaDp2b2lkfTtDb21tYW5kPXsvMzIvcmVxdWVzdF9yZXNwb25zZTp2b2lkLHNldF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRml4ZWQscmVpbml0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZW5hYmxlX2l0ZXJhdGlvbjp1OCxtb3Rvcl9vdmVycmlkZV9zcGVlZF8wOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8xOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8yOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8zOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF80OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF81OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF82OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF83OnUxNixzZXRfY29tbWFuZF9vdmVycmlkZTpib29sLHNldF9zdGF0ZV9tYXNrOlN0YXRlRmllbGRzLHNldF9zdGF0ZV9kZWxheTp1MTYsc2V0X3NkX3dyaXRlX2RlbGF5OnUxNixzZXRfbGVkOntwYXR0ZXJuOnU4LGNvbG9yX3JpZ2h0OkNvbG9yLGNvbG9yX2xlZnQ6Q29sb3IsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfSxzZXRfc2VyaWFsX3JjOntlbmFibGVkOmJvb2wsY29tbWFuZDpSY0NvbW1hbmQsYXV4X21hc2s6QXV4TWFza30sc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlOnsvOC9yZWNvcmRfdG9fY2FyZDp2b2lkLGxvY2tfcmVjb3JkaW5nX3N0YXRlOnZvaWR9LHNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb24scmVpbml0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX2NhcmRfcmVjb3JkaW5nX3N0YXRlOnZvaWQsc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzpDb25maWd1cmF0aW9uLHNldF9jb21tYW5kX3NvdXJjZXM6ey84L3NlcmlhbDp2b2lkLHJhZGlvOnZvaWR9LHNldF9jYWxpYnJhdGlvbjp7ZW5hYmxlZDpib29sLG1vZGU6dTh9LHNldF9hdXRvcGlsb3RfZW5hYmxlZDpib29sLHNldF91c2JfbW9kZTp1OH07RGVidWdTdHJpbmc9e2RlcHJlY2F0ZWRfbWFzazp1MzIsbWVzc2FnZTpzfTtIaXN0b3J5RGF0YT1EZWJ1Z1N0cmluZztSZXNwb25zZT17bWFzazp1MzIsYWNrOnUzMn07XCIsXCIxLjcudHh0XCI6XCJWZWN0b3IzZj17eDpmMzIseTpmMzIsejpmMzJ9O1BJRFNldHRpbmdzPXtrcDpmMzIsa2k6ZjMyLGtkOmYzMixpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6ZjMyLGRfZmlsdGVyX3RpbWU6ZjMyLHNldHBvaW50X2ZpbHRlcl90aW1lOmYzMixjb21tYW5kX3RvX3ZhbHVlOmYzMn07VmVyc2lvbj17bWFqb3I6dTgsbWlub3I6dTgscGF0Y2g6dTh9O0NvbmZpZ0lEPXUzMjtQY2JUcmFuc2Zvcm09e29yaWVudGF0aW9uOlZlY3RvcjNmLHRyYW5zbGF0aW9uOlZlY3RvcjNmfTtNaXhUYWJsZT17Zno6W2k4OjhdLHR4OltpODo4XSx0eTpbaTg6OF0sdHo6W2k4OjhdfTtNYWdCaWFzPXtvZmZzZXQ6VmVjdG9yM2Z9O0NoYW5uZWxQcm9wZXJ0aWVzPXthc3NpZ25tZW50Ont0aHJ1c3Q6dTgscGl0Y2g6dTgscm9sbDp1OCx5YXc6dTgsYXV4MTp1OCxhdXgyOnU4fSxpbnZlcnNpb246ey84L3RocnVzdDp2b2lkLHBpdGNoOnZvaWQscm9sbDp2b2lkLHlhdzp2b2lkLGF1eDE6dm9pZCxhdXgyOnZvaWR9LG1pZHBvaW50Olt1MTY6Nl0sZGVhZHpvbmU6W3UxNjo2XX07UElEQnlwYXNzPXsvOC90aHJ1c3RfbWFzdGVyOnZvaWQscGl0Y2hfbWFzdGVyOnZvaWQscm9sbF9tYXN0ZXI6dm9pZCx5YXdfbWFzdGVyOnZvaWQsdGhydXN0X3NsYXZlOnZvaWQscGl0Y2hfc2xhdmU6dm9pZCxyb2xsX3NsYXZlOnZvaWQseWF3X3NsYXZlOnZvaWR9O1BJRFBhcmFtZXRlcnM9e3RocnVzdF9tYXN0ZXI6UElEU2V0dGluZ3MscGl0Y2hfbWFzdGVyOlBJRFNldHRpbmdzLHJvbGxfbWFzdGVyOlBJRFNldHRpbmdzLHlhd19tYXN0ZXI6UElEU2V0dGluZ3MsdGhydXN0X3NsYXZlOlBJRFNldHRpbmdzLHBpdGNoX3NsYXZlOlBJRFNldHRpbmdzLHJvbGxfc2xhdmU6UElEU2V0dGluZ3MseWF3X3NsYXZlOlBJRFNldHRpbmdzLHRocnVzdF9nYWluOmYzMixwaXRjaF9nYWluOmYzMixyb2xsX2dhaW46ZjMyLHlhd19nYWluOmYzMixwaWRfYnlwYXNzOlBJREJ5cGFzc307U3RhdGVQYXJhbWV0ZXJzPXtzdGF0ZV9lc3RpbWF0aW9uOltmMzI6Ml0sZW5hYmxlOltmMzI6Ml19O1N0YXR1c0ZsYWc9ey8xNi9fMDp2b2lkLF8xOnZvaWQsXzI6dm9pZCxub19zaWduYWw6dm9pZCxpZGxlOnZvaWQsYXJtaW5nOnZvaWQscmVjb3JkaW5nX3NkOnZvaWQsXzc6dm9pZCxsb29wX3Nsb3c6dm9pZCxfOTp2b2lkLGFybWVkOnZvaWQsYmF0dGVyeV9sb3c6dm9pZCxiYXR0ZXJ5X2NyaXRpY2FsOnZvaWQsbG9nX2Z1bGw6dm9pZCxjcmFzaF9kZXRlY3RlZDp2b2lkLG92ZXJyaWRlOnZvaWR9O0NvbG9yPXtyZWQ6dTgsZ3JlZW46dTgsYmx1ZTp1OH07TEVEU3RhdGVDb2xvcnM9e3JpZ2h0X2Zyb250OkNvbG9yLHJpZ2h0X2JhY2s6Q29sb3IsbGVmdF9mcm9udDpDb2xvcixsZWZ0X2JhY2s6Q29sb3J9O0xFRFN0YXRlQ2FzZT17c3RhdHVzOlN0YXR1c0ZsYWcscGF0dGVybjp1OCxjb2xvcnM6TEVEU3RhdGVDb2xvcnMsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfTtMRURTdGF0ZXM9Wy8xNi9MRURTdGF0ZUNhc2U6MTZdO0xFRFN0YXRlc0ZpeGVkPVtMRURTdGF0ZUNhc2U6MTZdO0RldmljZU5hbWU9czk7SW5lcnRpYWxCaWFzPXthY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmfTtWZWxvY2l0eVBJREJ5cGFzcz17LzgvZm9yd2FyZF9tYXN0ZXI6dm9pZCxyaWdodF9tYXN0ZXI6dm9pZCx1cF9tYXN0ZXI6dm9pZCxfdW51c2VkX21hc3Rlcjp2b2lkLGZvcndhcmRfc2xhdmU6dm9pZCxyaWdodF9zbGF2ZTp2b2lkLHVwX3NsYXZlOnZvaWQsX3VudXNlZF9zbGF2ZTp2b2lkfTtWZWxvY2l0eVBJRFBhcmFtZXRlcnM9e2ZvcndhcmRfbWFzdGVyOlBJRFNldHRpbmdzLHJpZ2h0X21hc3RlcjpQSURTZXR0aW5ncyx1cF9tYXN0ZXI6UElEU2V0dGluZ3MsZm9yd2FyZF9zbGF2ZTpQSURTZXR0aW5ncyxyaWdodF9zbGF2ZTpQSURTZXR0aW5ncyx1cF9zbGF2ZTpQSURTZXR0aW5ncyxwaWRfYnlwYXNzOlZlbG9jaXR5UElEQnlwYXNzfTtDb25maWd1cmF0aW9uPXsvMTYvdmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlcyxuYW1lOkRldmljZU5hbWUsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6VmVsb2NpdHlQSURQYXJhbWV0ZXJzLGluZXJ0aWFsX2JpYXM6SW5lcnRpYWxCaWFzfTtDb25maWd1cmF0aW9uRml4ZWQ9e3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXNGaXhlZCxuYW1lOkRldmljZU5hbWUsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6VmVsb2NpdHlQSURQYXJhbWV0ZXJzLGluZXJ0aWFsX2JpYXM6SW5lcnRpYWxCaWFzfTtDb25maWd1cmF0aW9uRmxhZz17LzE2L3ZlcnNpb246dm9pZCxpZDp2b2lkLHBjYl90cmFuc2Zvcm06dm9pZCxtaXhfdGFibGU6dm9pZCxtYWdfYmlhczp2b2lkLGNoYW5uZWw6dm9pZCxwaWRfcGFyYW1ldGVyczp2b2lkLHN0YXRlX3BhcmFtZXRlcnM6dm9pZCxsZWRfc3RhdGVzOlsvL3ZvaWQ6MTZdLG5hbWU6dm9pZCx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczp2b2lkLGluZXJ0aWFsX2JpYXM6dm9pZH07Um90YXRpb249e3BpdGNoOmYzMixyb2xsOmYzMix5YXc6ZjMyfTtQSURTdGF0ZT17dGltZXN0YW1wX3VzOnUzMixpbnB1dDpmMzIsc2V0cG9pbnQ6ZjMyLHBfdGVybTpmMzIsaV90ZXJtOmYzMixkX3Rlcm06ZjMyfTtSY0NvbW1hbmQ9e3Rocm90dGxlOmkxNixwaXRjaDppMTYscm9sbDppMTYseWF3OmkxNn07U3RhdGU9ey8zMi90aW1lc3RhbXBfdXM6dTMyLHN0YXR1czpTdGF0dXNGbGFnLHYwX3Jhdzp1MTYsaTBfcmF3OnUxNixpMV9yYXc6dTE2LGFjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2YsbWFnOlZlY3RvcjNmLHRlbXBlcmF0dXJlOnUxNixwcmVzc3VyZTp1MzIscHBtOltpMTY6Nl0sYXV4X2NoYW5fbWFzazp1OCxjb21tYW5kOlJjQ29tbWFuZCxjb250cm9sOntmejpmMzIsdHg6ZjMyLHR5OmYzMix0ejpmMzJ9LHBpZF9tYXN0ZXJfZno6UElEU3RhdGUscGlkX21hc3Rlcl90eDpQSURTdGF0ZSxwaWRfbWFzdGVyX3R5OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHo6UElEU3RhdGUscGlkX3NsYXZlX2Z6OlBJRFN0YXRlLHBpZF9zbGF2ZV90eDpQSURTdGF0ZSxwaWRfc2xhdmVfdHk6UElEU3RhdGUscGlkX3NsYXZlX3R6OlBJRFN0YXRlLG1vdG9yX291dDpbaTE2OjhdLGtpbmVtYXRpY3NfYW5nbGU6Um90YXRpb24sa2luZW1hdGljc19yYXRlOlJvdGF0aW9uLGtpbmVtYXRpY3NfYWx0aXR1ZGU6ZjMyLGxvb3BfY291bnQ6dTMyfTtTdGF0ZUZpZWxkcz17LzMyL3RpbWVzdGFtcF91czp2b2lkLHN0YXR1czp2b2lkLHYwX3Jhdzp2b2lkLGkwX3Jhdzp2b2lkLGkxX3Jhdzp2b2lkLGFjY2VsOnZvaWQsZ3lybzp2b2lkLG1hZzp2b2lkLHRlbXBlcmF0dXJlOnZvaWQscHJlc3N1cmU6dm9pZCxwcG06dm9pZCxhdXhfY2hhbl9tYXNrOnZvaWQsY29tbWFuZDp2b2lkLGNvbnRyb2w6dm9pZCxwaWRfbWFzdGVyX2Z6OnZvaWQscGlkX21hc3Rlcl90eDp2b2lkLHBpZF9tYXN0ZXJfdHk6dm9pZCxwaWRfbWFzdGVyX3R6OnZvaWQscGlkX3NsYXZlX2Z6OnZvaWQscGlkX3NsYXZlX3R4OnZvaWQscGlkX3NsYXZlX3R5OnZvaWQscGlkX3NsYXZlX3R6OnZvaWQsbW90b3Jfb3V0OnZvaWQsa2luZW1hdGljc19hbmdsZTp2b2lkLGtpbmVtYXRpY3NfcmF0ZTp2b2lkLGtpbmVtYXRpY3NfYWx0aXR1ZGU6dm9pZCxsb29wX2NvdW50OnZvaWR9O0F1eE1hc2s9ey8vYXV4MV9sb3c6dm9pZCxhdXgxX21pZDp2b2lkLGF1eDFfaGlnaDp2b2lkLGF1eDJfbG93OnZvaWQsYXV4Ml9taWQ6dm9pZCxhdXgyX2hpZ2g6dm9pZH07Q29tbWFuZD17LzMyL3JlcXVlc3RfcmVzcG9uc2U6dm9pZCxzZXRfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZpeGVkLHJlaW5pdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VuYWJsZV9pdGVyYXRpb246dTgsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMzp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNzp1MTYsc2V0X2NvbW1hbmRfb3ZlcnJpZGU6Ym9vbCxzZXRfc3RhdGVfbWFzazpTdGF0ZUZpZWxkcyxzZXRfc3RhdGVfZGVsYXk6dTE2LHNldF9zZF93cml0ZV9kZWxheTp1MTYsc2V0X2xlZDp7cGF0dGVybjp1OCxjb2xvcl9yaWdodF9mcm9udDpDb2xvcixjb2xvcl9sZWZ0X2Zyb250OkNvbG9yLGNvbG9yX3JpZ2h0X2JhY2s6Q29sb3IsY29sb3JfbGVmdF9iYWNrOkNvbG9yLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH0sc2V0X3NlcmlhbF9yYzp7ZW5hYmxlZDpib29sLGNvbW1hbmQ6UmNDb21tYW5kLGF1eF9tYXNrOkF1eE1hc2t9LHNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTp7LzgvcmVjb3JkX3RvX2NhcmQ6dm9pZCxsb2NrX3JlY29yZGluZ19zdGF0ZTp2b2lkfSxzZXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uLHJlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTp2b2lkLHNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6Q29uZmlndXJhdGlvbixzZXRfY29tbWFuZF9zb3VyY2VzOnsvOC9zZXJpYWw6dm9pZCxyYWRpbzp2b2lkfSxzZXRfY2FsaWJyYXRpb246e2VuYWJsZWQ6Ym9vbCxtb2RlOnU4fSxzZXRfYXV0b3BpbG90X2VuYWJsZWQ6Ym9vbCxzZXRfdXNiX21vZGU6dTh9O0RlYnVnU3RyaW5nPXtkZXByZWNhdGVkX21hc2s6dTMyLG1lc3NhZ2U6c307SGlzdG9yeURhdGE9RGVidWdTdHJpbmc7UmVzcG9uc2U9e21hc2s6dTMyLGFjazp1MzJ9O1wifTtcbiAgICAgICAgcmV0dXJuIHsgdmVyc2lvbnM6IHZlcnNpb25zLCBmaWxlczogZmlsZXMgfTtcbiAgICB9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NhbGlicmF0aW9uJywgY2FsaWJyYXRpb24pO1xyXG5cclxuICAgIGNhbGlicmF0aW9uLiRpbmplY3QgPSBbJ2NvbW1hbmRMb2cnLCAnc2VyaWFsJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsaWJyYXRpb24oY29tbWFuZExvZywgc2VyaWFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbWFnbmV0b21ldGVyOiBtYWduZXRvbWV0ZXIsXHJcbiAgICAgICAgICAgIGFjY2VsZXJvbWV0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGZsYXQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnZmxhdCcsIDApLFxyXG4gICAgICAgICAgICAgICAgZm9yd2FyZDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGZvcndhcmQnLCAxKSxcclxuICAgICAgICAgICAgICAgIGJhY2s6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBiYWNrJywgMiksXHJcbiAgICAgICAgICAgICAgICByaWdodDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIHJpZ2h0JywgMyksXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gbGVmdCcsIDQpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmaW5pc2g6IGZpbmlzaCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBtYWduZXRvbWV0ZXIoKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJDYWxpYnJhdGluZyBtYWduZXRvbWV0ZXIgYmlhc1wiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9jYWxpYnJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIocG9zZURlc2NyaXB0aW9uLCBwb3NlSWQpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIGdyYXZpdHkgZm9yIHBvc2U6IFwiICsgcG9zZURlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9jYWxpYnJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogcG9zZUlkICsgMSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZpbmlzaCgpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkZpbmlzaGluZyBjYWxpYnJhdGlvblwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9jYWxpYnJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjb2JzJywgY29icyk7XHJcblxyXG4gICAgZnVuY3Rpb24gY29icygpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBSZWFkZXI6IFJlYWRlcixcclxuICAgICAgICAgICAgZW5jb2RlOiBlbmNvZGUsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gUmVhZGVyKGNhcGFjaXR5KSB7XHJcbiAgICAgICAgaWYgKGNhcGFjaXR5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY2FwYWNpdHkgPSAyMDAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLk4gPSBjYXBhY2l0eTtcclxuICAgICAgICB0aGlzLmJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGNhcGFjaXR5KTtcclxuICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzRGVjb2RlKHJlYWRlcikge1xyXG4gICAgICAgIHZhciBzcmNfcHRyID0gMDtcclxuICAgICAgICB2YXIgZHN0X3B0ciA9IDA7XHJcbiAgICAgICAgdmFyIGxlZnRvdmVyX2xlbmd0aCA9IDA7XHJcbiAgICAgICAgdmFyIGFwcGVuZF96ZXJvID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKHJlYWRlci5idWZmZXJbc3JjX3B0cl0pIHtcclxuICAgICAgICAgICAgaWYgKCFsZWZ0b3Zlcl9sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcHBlbmRfemVybylcclxuICAgICAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSAwO1xyXG4gICAgICAgICAgICAgICAgbGVmdG92ZXJfbGVuZ3RoID0gcmVhZGVyLmJ1ZmZlcltzcmNfcHRyKytdIC0gMTtcclxuICAgICAgICAgICAgICAgIGFwcGVuZF96ZXJvID0gbGVmdG92ZXJfbGVuZ3RoIDwgMHhGRTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC0tbGVmdG92ZXJfbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLmJ1ZmZlcltkc3RfcHRyKytdID0gcmVhZGVyLmJ1ZmZlcltzcmNfcHRyKytdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbGVmdG92ZXJfbGVuZ3RoID8gMCA6IGRzdF9wdHI7XHJcbiAgICB9XHJcblxyXG4gICAgUmVhZGVyLnByb3RvdHlwZS5yZWFkQnl0ZXMgPSBmdW5jdGlvbihkYXRhLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGMgPSBkYXRhW2ldO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpcnN0IGJ5dGUgb2YgYSBuZXcgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW3RoaXMuYnVmZmVyX2xlbmd0aCsrXSA9IGM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyX2xlbmd0aCA9PT0gdGhpcy5OKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVmZmVyIG92ZXJmbG93LCBwcm9iYWJseSBkdWUgdG8gZXJyb3JzIGluIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdvdmVyZmxvdycsICdidWZmZXIgb3ZlcmZsb3cgaW4gQ09CUyBkZWNvZGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSBjb2JzRGVjb2RlKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgZmFpbGVkX2RlY29kZSA9ICh0aGlzLmJ1ZmZlcl9sZW5ndGggPT09IDApO1xyXG4gICAgICAgICAgICBpZiAoZmFpbGVkX2RlY29kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBqO1xyXG4gICAgICAgICAgICBmb3IgKGogPSAxOyBqIDwgdGhpcy5idWZmZXJfbGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyWzBdIF49IHRoaXMuYnVmZmVyW2pdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1ZmZlclswXSA9PT0gMCkgeyAgLy8gY2hlY2sgc3VtIGlzIGNvcnJlY3RcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1ZmZlcl9sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHRoaXMuYnVmZmVyLnNsaWNlKDEsIHRoaXMuYnVmZmVyX2xlbmd0aCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdzaG9ydCcsICdUb28gc2hvcnQgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7ICAvLyBiYWQgY2hlY2tzdW1cclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHZhciBieXRlcyA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgdGhpcy5idWZmZXJfbGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBieXRlcyArPSB0aGlzLmJ1ZmZlcltqXSArIFwiLFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzLmJ1ZmZlcltqXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZmFpbGVkX2RlY29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ2ZyYW1lJywgJ1VuZXhwZWN0ZWQgZW5kaW5nIG9mIHBhY2tldCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbXNnID0gJ0JBRCBDSEVDS1NVTSAoJyArIHRoaXMuYnVmZmVyX2xlbmd0aCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcgYnl0ZXMpJyArIGJ5dGVzICsgbWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdjaGVja3N1bScsIG1zZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGVuY29kZShidWYpIHtcclxuICAgICAgICB2YXIgcmV0dmFsID1cclxuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoTWF0aC5mbG9vcigoYnVmLmJ5dGVMZW5ndGggKiAyNTUgKyA3NjEpIC8gMjU0KSk7XHJcbiAgICAgICAgdmFyIGxlbiA9IDE7XHJcbiAgICAgICAgdmFyIHBvc19jdHIgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXR2YWxbcG9zX2N0cl0gPT0gMHhGRSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMHhGRjtcclxuICAgICAgICAgICAgICAgIHBvc19jdHIgPSBsZW4rKztcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZhbCA9IGJ1ZltpXTtcclxuICAgICAgICAgICAgKytyZXR2YWxbcG9zX2N0cl07XHJcbiAgICAgICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHZhbFtsZW4rK10gPSB2YWw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwb3NfY3RyID0gbGVuKys7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXR2YWwuc3ViYXJyYXkoMCwgbGVuKS5zbGljZSgpLmJ1ZmZlcjtcclxuICAgIH07XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvbW1hbmRMb2cnLCBjb21tYW5kTG9nKTtcclxuXHJcbiAgICBjb21tYW5kTG9nLiRpbmplY3QgPSBbJyRxJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY29tbWFuZExvZygkcSkge1xyXG4gICAgICAgIHZhciBtZXNzYWdlcyA9IFtdO1xyXG4gICAgICAgIHZhciByZXNwb25kZXIgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICB2YXIgc2VydmljZSA9IGxvZztcclxuICAgICAgICBzZXJ2aWNlLmxvZyA9IGxvZztcclxuICAgICAgICBzZXJ2aWNlLmNsZWFyU3Vic2NyaWJlcnMgPSBjbGVhclN1YnNjcmliZXJzO1xyXG4gICAgICAgIHNlcnZpY2Uub25NZXNzYWdlID0gb25NZXNzYWdlO1xyXG4gICAgICAgIHNlcnZpY2UucmVhZCA9IHJlYWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBzZXJ2aWNlO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsb2cobWVzc2FnZSkge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uZGVyLm5vdGlmeShyZWFkKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWFkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjbGVhclN1YnNjcmliZXJzKCkge1xyXG4gICAgICAgICAgICByZXNwb25kZXIgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25NZXNzYWdlKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25kZXIucHJvbWlzZS50aGVuKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdkZXZpY2VDb25maWcnLCBkZXZpY2VDb25maWcpO1xyXG5cclxuICAgIGRldmljZUNvbmZpZy4kaW5qZWN0ID0gWydzZXJpYWwnLCAnY29tbWFuZExvZycsICdmaXJtd2FyZVZlcnNpb24nLCAnc2VyaWFsaXphdGlvbkhhbmRsZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBkZXZpY2VDb25maWcoc2VyaWFsLCBjb21tYW5kTG9nLCBmaXJtd2FyZVZlcnNpb24sIHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIGNvbmZpZztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIGNhbGxiYWNrIGRlZmluZWQgZm9yIHJlY2VpdmluZyBjb25maWd1cmF0aW9ucyEnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbG9nZ2luZ0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAnTm8gY2FsbGJhY2sgZGVmaW5lZCBmb3IgcmVjZWl2aW5nIGxvZ2dpbmcgc3RhdGUhJyArXHJcbiAgICAgICAgICAgICAgICAnIENhbGxiYWNrIGFyZ3VtZW50czogKGlzTG9nZ2luZywgaXNMb2NrZWQsIGRlbGF5KScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlcmlhbC5hZGRPblJlY2VpdmVDYWxsYmFjayhmdW5jdGlvbihtZXNzYWdlVHlwZSwgbWVzc2FnZSkge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgIT09ICdDb21tYW5kJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgnc2V0X2VlcHJvbV9kYXRhJyBpbiBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShtZXNzYWdlLnNldF9lZXByb21fZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdzZXRfcGFydGlhbF9lZXByb21fZGF0YScgaW4gbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlQ29uZmlnRnJvbVJlbW90ZURhdGEobWVzc2FnZS5zZXRfcGFydGlhbF9lZXByb21fZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCgnc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlJyBpbiBtZXNzYWdlKSAmJiAoJ3NldF9zZF93cml0ZV9kZWxheScgaW4gbWVzc2FnZSkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjYXJkX3JlY19zdGF0ZSA9IG1lc3NhZ2Uuc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNkX3dyaXRlX2RlbGF5ID0gbWVzc2FnZS5zZXRfc2Rfd3JpdGVfZGVsYXk7XHJcbiAgICAgICAgICAgICAgICBsb2dnaW5nQ2FsbGJhY2soY2FyZF9yZWNfc3RhdGUucmVjb3JkX3RvX2NhcmQsIGNhcmRfcmVjX3N0YXRlLmxvY2tfcmVjb3JkaW5nX3N0YXRlLCBzZF93cml0ZV9kZWxheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0RGVzaXJlZFZlcnNpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaXJtd2FyZVZlcnNpb24uZGVzaXJlZCgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3QoKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdSZXF1ZXN0aW5nIGN1cnJlbnQgY29uZmlndXJhdGlvbiBkYXRhLi4uJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXFfcGFydGlhbF9lZXByb21fZGF0YTogaGFuZGxlcnMuQ29uZmlndXJhdGlvbkZsYWcuZW1wdHkoKSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVpbml0KCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdTZXR0aW5nIGZhY3RvcnkgZGVmYXVsdCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlaW5pdF9lZXByb21fZGF0YTogdHJ1ZSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlcXVlc3QgZm9yIGZhY3RvcnkgcmVzZXQgZmFpbGVkOiAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQobmV3Q29uZmlnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZW5kQ29uZmlnKHsgY29uZmlnOiBuZXdDb25maWcsIHRlbXBvcmFyeTogZmFsc2UsIHJlcXVlc3RVcGRhdGU6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kQ29uZmlnKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIHZhciBtYXNrID0gcHJvcGVydGllcy5tYXNrIHx8IGhhbmRsZXJzLkNvbmZpZ3VyYXRpb25GbGFnLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHZhciBuZXdDb25maWcgPSBwcm9wZXJ0aWVzLmNvbmZpZyB8fCBjb25maWc7XHJcbiAgICAgICAgICAgIHZhciByZXF1ZXN0VXBkYXRlID0gcHJvcGVydGllcy5yZXF1ZXN0VXBkYXRlIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLnRlbXBvcmFyeSkge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnID0gbmV3Q29uZmlnO1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IHsgc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzogbWFzayB9O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRfcGFydGlhbF9lZXByb21fZGF0YSA9IG5ld0NvbmZpZztcclxuICAgICAgICAgICAgICAgIG1hc2sgPSB7IHNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBtYXNrIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywgbWVzc2FnZSwgdHJ1ZSwgbWFzaykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0VXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKGNvbmZpZ0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgLy9jb21tYW5kTG9nKCdSZWNlaXZlZCBjb25maWchJyk7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLnVwZGF0ZUZpZWxkcyhjb25maWcsIGNvbmZpZ0NoYW5nZXMpO1xyXG4gICAgICAgICAgICB2YXIgdmVyc2lvbiA9IFtjb25maWcudmVyc2lvbi5tYWpvciwgY29uZmlnLnZlcnNpb24ubWlub3IsIGNvbmZpZy52ZXJzaW9uLnBhdGNoXTtcclxuICAgICAgICAgICAgZmlybXdhcmVWZXJzaW9uLnNldCh2ZXJzaW9uKTtcclxuICAgICAgICAgICAgaWYgKCFmaXJtd2FyZVZlcnNpb24uc3VwcG9ydGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1JlY2VpdmVkIGFuIHVuc3VwcG9ydGVkIGNvbmZpZ3VyYXRpb24hJyk7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICdGb3VuZCB2ZXJzaW9uOiAnICsgdmVyc2lvblswXSArICcuJyArIHZlcnNpb25bMV0gKyAnLicgKyB2ZXJzaW9uWzJdICArXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtLS0gTmV3ZXN0IHZlcnNpb246ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkS2V5KCkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgJ1JlY2VpdmVkIGNvbmZpZ3VyYXRpb24gZGF0YSAodicgK1xyXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb25bMF0gKyAnLicgKyB2ZXJzaW9uWzFdICsgJy4nICsgdmVyc2lvblsyXSArJyknKTtcclxuICAgICAgICAgICAgICAgIGNvbmZpZ0NhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldENvbmZpZ0NhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZ0NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRMb2dnaW5nQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgbG9nZ2luZ0NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRDb25maWcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKS5Db25maWd1cmF0aW9uLmVtcHR5KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXHJcbiAgICAgICAgICAgIHJlaW5pdDogcmVpbml0LFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBzZW5kQ29uZmlnOiBzZW5kQ29uZmlnLFxyXG4gICAgICAgICAgICBnZXRDb25maWc6IGdldENvbmZpZyxcclxuICAgICAgICAgICAgc2V0Q29uZmlnQ2FsbGJhY2s6IHNldENvbmZpZ0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBzZXRMb2dnaW5nQ2FsbGJhY2s6IHNldExvZ2dpbmdDYWxsYmFjayxcclxuICAgICAgICAgICAgZ2V0RGVzaXJlZFZlcnNpb246IGdldERlc2lyZWRWZXJzaW9uLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2Zpcm13YXJlVmVyc2lvbicsIGZpcm13YXJlVmVyc2lvbik7XHJcblxyXG4gICAgZmlybXdhcmVWZXJzaW9uLiRpbmplY3QgPSBbJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZmlybXdhcmVWZXJzaW9uKHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIHZlcnNpb24gPSBbMCwgMCwgMF07XHJcbiAgICAgICAgdmFyIGtleSA9ICcwLjAuMCc7XHJcblxyXG4gICAgICAgIHZhciBuZXdlc3RWZXJzaW9uID0gc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0TmV3ZXN0VmVyc2lvbigpO1xyXG5cclxuICAgICAgICB2YXIgZGVzaXJlZCA9IFtuZXdlc3RWZXJzaW9uLm1ham9yLCBuZXdlc3RWZXJzaW9uLm1pbm9yLCBuZXdlc3RWZXJzaW9uLnBhdGNoXTtcclxuICAgICAgICB2YXIgZGVzaXJlZEtleSA9IGRlc2lyZWRbMF0udG9TdHJpbmcoKSArICcuJyArIGRlc2lyZWRbMV0udG9TdHJpbmcoKSArICcuJyArIGRlc2lyZWRbMl0udG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgdmFyIGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlciA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmFsdWUuam9pbignLicpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID1cclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGRlc2lyZWRLZXkpIHx8IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBrZXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3VwcG9ydGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhIXNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoa2V5KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZEtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZEtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2xlZCcsIGxlZCk7XHJcblxyXG4gICAgbGVkLiRpbmplY3QgPSBbJyRxJywgJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxlZCgkcSwgc2VyaWFsKSB7XHJcbiAgICAgICAgdmFyIExlZFBhdHRlcm5zID0ge1xyXG4gICAgICAgICAgICBOT19PVkVSUklERTogMCxcclxuICAgICAgICAgICAgRkxBU0g6IDEsXHJcbiAgICAgICAgICAgIEJFQUNPTjogMixcclxuICAgICAgICAgICAgQlJFQVRIRTogMyxcclxuICAgICAgICAgICAgQUxURVJOQVRFOiA0LFxyXG4gICAgICAgICAgICBTT0xJRDogNSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgdXJnZW50ID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGJsYWNrID0ge3JlZDogMCwgZ3JlZW46IDAsIGJsdWU6IDB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXQocmlnaHRfZnJvbnQsIHJpZ2h0X2JhY2ssIGxlZnRfZnJvbnQsIGxlZnRfYmFjaywgcGF0dGVybiwgcmVkLCBncmVlbikge1xyXG4gICAgICAgICAgICBpZiAoIXVyZ2VudCAmJiBzZXJpYWwuYnVzeSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KCdTZXJpYWwgY29ubmVjdGlvbiBpcyB0b28gYnVzeScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4gfHwgTGVkUGF0dGVybnMuTk9fT1ZFUlJJREU7XHJcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IExlZFBhdHRlcm5zLk5PX09WRVJSSURFO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdHRlcm4gPiA1KSB7XHJcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gTGVkUGF0dGVybnMuU09MSUQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBzZXR0ZXJfY29tbWFuZCA9IHtcclxuICAgICAgICAgICAgICAgIHBhdHRlcm46IHBhdHRlcm4sXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9yaWdodDogcmlnaHRfZnJvbnQgfHwgYmxhY2ssXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9sZWZ0OiBsZWZ0X2Zyb250IHx8IGJsYWNrLFxyXG4gICAgICAgICAgICAgICAgY29sb3JfcmlnaHRfZnJvbnQ6IHJpZ2h0X2Zyb250IHx8IGJsYWNrLFxyXG4gICAgICAgICAgICAgICAgY29sb3JfbGVmdF9mcm9udDogbGVmdF9mcm9udCB8fCBibGFjayxcclxuICAgICAgICAgICAgICAgIGNvbG9yX3JpZ2h0X2JhY2s6IHJpZ2h0X2JhY2sgfHwgYmxhY2ssXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9sZWZ0X2JhY2s6IGxlZnRfYmFjayB8fCBibGFjayxcclxuICAgICAgICAgICAgICAgIGluZGljYXRvcl9yZWQ6IHJlZCxcclxuICAgICAgICAgICAgICAgIGluZGljYXRvcl9ncmVlbjogZ3JlZW4sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2xlZDogc2V0dGVyX2NvbW1hbmQsXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFNpbXBsZShyZWQsIGdyZWVuLCBibHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xvciA9IHtyZWQ6IHJlZCB8fCAwLCBncmVlbjogZ3JlZW4gfHwgMCwgYmx1ZTogYmx1ZSB8fCAwfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNldChjb2xvciwgY29sb3IsIGNvbG9yLCBjb2xvciwgTGVkUGF0dGVybnMuU09MSUQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXIoKSB7XHJcbiAgICAgICAgICAgIGZvcmNlTmV4dFNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZm9yY2VOZXh0U2VuZCgpIHtcclxuICAgICAgICAgICAgdXJnZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogc2V0LFxyXG4gICAgICAgICAgICBzZXRTaW1wbGU6IHNldFNpbXBsZSxcclxuICAgICAgICAgICAgY2xlYXI6IGNsZWFyLFxyXG4gICAgICAgICAgICBwYXR0ZXJuczogTGVkUGF0dGVybnMsXHJcbiAgICAgICAgICAgIGZvcmNlTmV4dFNlbmQ6IGZvcmNlTmV4dFNlbmQsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3JjRGF0YScsIHJjRGF0YSk7XHJcblxyXG4gICAgcmNEYXRhLiRpbmplY3QgPSBbJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJjRGF0YShzZXJpYWwpIHtcclxuICAgICAgICB2YXIgQVVYID0ge1xyXG4gICAgICAgICAgICBMT1c6IDAsXHJcbiAgICAgICAgICAgIE1JRDogMSxcclxuICAgICAgICAgICAgSElHSDogMixcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBhdXhOYW1lcyA9IFsnbG93JywgJ21pZCcsICdoaWdoJ107XHJcblxyXG4gICAgICAgIHZhciB0aHJvdHRsZSA9IC0xO1xyXG4gICAgICAgIHZhciBwaXRjaCA9IDA7XHJcbiAgICAgICAgdmFyIHJvbGwgPSAwO1xyXG4gICAgICAgIHZhciB5YXcgPSAwO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvIGhpZ2ggLS0gbG93IGlzIGVuYWJsaW5nOyBoaWdoIGlzIGRpc2FibGluZ1xyXG4gICAgICAgIHZhciBhdXgxID0gQVVYLkhJR0g7XHJcbiAgICAgICAgLy8gZGVmYXVsdHMgdG8gPz8gLS0gbmVlZCB0byBjaGVjayB0cmFuc21pdHRlciBiZWhhdmlvclxyXG4gICAgICAgIHZhciBhdXgyID0gQVVYLkhJR0g7XHJcblxyXG4gICAgICAgIHZhciB1cmdlbnQgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzZXRUaHJvdHRsZTogc2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIHNldFBpdGNoOiBzZXRQaXRjaCxcclxuICAgICAgICAgICAgc2V0Um9sbDogc2V0Um9sbCxcclxuICAgICAgICAgICAgc2V0WWF3OiBzZXRZYXcsXHJcbiAgICAgICAgICAgIHNldEF1eDE6IHNldEF1eDEsXHJcbiAgICAgICAgICAgIHNldEF1eDI6IHNldEF1eDIsXHJcbiAgICAgICAgICAgIGdldFRocm90dGxlOiBnZXRUaHJvdHRsZSxcclxuICAgICAgICAgICAgZ2V0UGl0Y2g6IGdldFBpdGNoLFxyXG4gICAgICAgICAgICBnZXRSb2xsOiBnZXRSb2xsLFxyXG4gICAgICAgICAgICBnZXRZYXc6IGdldFlhdyxcclxuICAgICAgICAgICAgZ2V0QXV4MTogZ2V0QXV4MSxcclxuICAgICAgICAgICAgZ2V0QXV4MjogZ2V0QXV4MixcclxuICAgICAgICAgICAgQVVYOiBBVVgsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIGZvcmNlTmV4dFNlbmQ6IGZvcmNlTmV4dFNlbmQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZCgpIHtcclxuICAgICAgICAgICAgaWYgKCF1cmdlbnQgJiYgc2VyaWFsLmJ1c3koKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmVydCBwaXRjaCBhbmQgcm9sbFxyXG4gICAgICAgICAgICB2YXIgdGhyb3R0bGVfdGhyZXNob2xkID1cclxuICAgICAgICAgICAgICAgIC0wLjg7ICAvLyBrZWVwIGJvdHRvbSAxMCUgb2YgdGhyb3R0bGUgc3RpY2sgdG8gbWVhbiAnb2ZmJ1xyXG4gICAgICAgICAgICBjb21tYW5kLnRocm90dGxlID0gY29uc3RyYWluKFxyXG4gICAgICAgICAgICAgICAgKHRocm90dGxlIC0gdGhyb3R0bGVfdGhyZXNob2xkKSAqIDQwOTUgL1xyXG4gICAgICAgICAgICAgICAgICAgICgxIC0gdGhyb3R0bGVfdGhyZXNob2xkKSxcclxuICAgICAgICAgICAgICAgIDAsIDQwOTUpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnBpdGNoID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUocGl0Y2gsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuICAgICAgICAgICAgY29tbWFuZC5yb2xsID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigoYXBwbHlEZWFkem9uZShyb2xsLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQueWF3ID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUoeWF3LCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYXV4X21hc2sgPSB7fTtcclxuICAgICAgICAgICAgLy8gYXV4MV9sb3csIGF1eDFfbWlkLCBhdXgxX2hpZ2gsIGFuZCBzYW1lIHdpdGggYXV4MlxyXG4gICAgICAgICAgICBhdXhfbWFza1snYXV4MV8nICsgYXV4TmFtZXNbYXV4MV1dID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXV4X21hc2tbJ2F1eDJfJyArIGF1eE5hbWVzW2F1eDJdXSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X3NlcmlhbF9yYzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZCxcclxuICAgICAgICAgICAgICAgICAgICBhdXhfbWFzazogYXV4X21hc2ssXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRUaHJvdHRsZSh2KSB7XHJcbiAgICAgICAgICAgIHRocm90dGxlID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFBpdGNoKHYpIHtcclxuICAgICAgICAgICAgcGl0Y2ggPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Um9sbCh2KSB7XHJcbiAgICAgICAgICAgIHJvbGwgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0WWF3KHYpIHtcclxuICAgICAgICAgICAgeWF3ID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDEodikge1xyXG4gICAgICAgICAgICBhdXgxID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMiwgdikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QXV4Mih2KSB7XHJcbiAgICAgICAgICAgIGF1eDIgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyLCB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUaHJvdHRsZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRocm90dGxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UGl0Y2goKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXRjaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJvbGwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByb2xsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0WWF3KCkge1xyXG4gICAgICAgICAgICByZXR1cm4geWF3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXV4MSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF1eDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBdXgyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXV4MjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcmNlTmV4dFNlbmQoKSB7XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb25zdHJhaW4oeCwgeG1pbiwgeG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoeG1pbiwgTWF0aC5taW4oeCwgeG1heCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHlEZWFkem9uZSh2YWx1ZSwgZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID4gZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAtIGRlYWR6b25lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IC1kZWFkem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgZGVhZHpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdzZXJpYWwnLCBzZXJpYWwpO1xyXG5cclxuICAgIHNlcmlhbC4kaW5qZWN0ID0gWyckdGltZW91dCcsICckcScsICdjb2JzJywgJ2NvbW1hbmRMb2cnLCAnZmlybXdhcmVWZXJzaW9uJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gc2VyaWFsKCR0aW1lb3V0LCAkcSwgY29icywgY29tbWFuZExvZywgZmlybXdhcmVWZXJzaW9uLCBzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciBNZXNzYWdlVHlwZSA9IHtcclxuICAgICAgICAgICAgU3RhdGU6IDAsXHJcbiAgICAgICAgICAgIENvbW1hbmQ6IDEsXHJcbiAgICAgICAgICAgIERlYnVnU3RyaW5nOiAzLFxyXG4gICAgICAgICAgICBIaXN0b3J5RGF0YTogNCxcclxuICAgICAgICAgICAgUHJvdG9jb2w6IDEyOCxcclxuICAgICAgICAgICAgUmVzcG9uc2U6IDI1NSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgYWNrbm93bGVkZ2VzID0gW107XHJcbiAgICAgICAgdmFyIGJhY2tlbmQgPSBuZXcgQmFja2VuZCgpO1xyXG5cclxuICAgICAgICB2YXIgb25SZWNlaXZlTGlzdGVuZXJzID0gW107XHJcblxyXG4gICAgICAgIHZhciBjb2JzUmVhZGVyID0gbmV3IGNvYnMuUmVhZGVyKDEwMDAwKTtcclxuICAgICAgICB2YXIgYnl0ZXNIYW5kbGVyID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBCYWNrZW5kKCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUuYnVzeSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJzZW5kXCIgZGVmaW5lZCBmb3Igc2VyaWFsIGJhY2tlbmQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5vblJlYWQgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIFwib25SZWFkXCIgZGVmaW5lZCBmb3Igc2VyaWFsIGJhY2tlbmQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgTWVzc2FnZVR5cGVJbnZlcnNpb24gPSBbXTtcclxuICAgICAgICBPYmplY3Qua2V5cyhNZXNzYWdlVHlwZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgTWVzc2FnZVR5cGVJbnZlcnNpb25bTWVzc2FnZVR5cGVba2V5XV0gPSBrZXk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1Jlc3BvbnNlJykge1xyXG4gICAgICAgICAgICAgICAgYWNrbm93bGVkZ2UobWVzc2FnZS5tYXNrLCBtZXNzYWdlLmFjayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZVR5cGUgPT09ICdQcm90b2NvbCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gbWVzc2FnZS5yZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuYWRkSGFuZGxlcihkYXRhLnZlcnNpb24sIGRhdGEuc3RydWN0dXJlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBidXN5OiBidXN5LFxyXG4gICAgICAgICAgICBzZW5kU3RydWN0dXJlOiBzZW5kU3RydWN0dXJlLFxyXG4gICAgICAgICAgICBzZXRCYWNrZW5kOiBzZXRCYWNrZW5kLFxyXG4gICAgICAgICAgICBhZGRPblJlY2VpdmVDYWxsYmFjazogYWRkT25SZWNlaXZlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrOiByZW1vdmVPblJlY2VpdmVDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0Qnl0ZXNIYW5kbGVyOiBzZXRCeXRlc0hhbmRsZXIsXHJcbiAgICAgICAgICAgIGhhbmRsZVBvc3RDb25uZWN0OiBoYW5kbGVQb3N0Q29ubmVjdCxcclxuICAgICAgICAgICAgQmFja2VuZDogQmFja2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCYWNrZW5kKHYpIHtcclxuICAgICAgICAgICAgYmFja2VuZCA9IHY7XHJcbiAgICAgICAgICAgIGJhY2tlbmQub25SZWFkID0gcmVhZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVBvc3RDb25uZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kU3RydWN0dXJlKG1lc3NhZ2VUeXBlLCBkYXRhLCBsb2dfc2VuZCwgZXh0cmFNYXNrKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1N0YXRlJykge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHByb2Nlc3NTdGF0ZU91dHB1dChkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIE1lc3NhZ2VUeXBlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucmVqZWN0KCdNZXNzYWdlIHR5cGUgXCInICsgbWVzc2FnZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcIiBub3Qgc3VwcG9ydGVkIGJ5IGFwcCwgc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZXMgYXJlOicgK1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKE1lc3NhZ2VUeXBlKS5qb2luKCcsICcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucmVqZWN0KCdNZXNzYWdlIHR5cGUgXCInICsgbWVzc2FnZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcIiBub3Qgc3VwcG9ydGVkIGJ5IGZpcm13YXJlLCBzdXBwb3J0ZWQgbWVzc2FnZSB0eXBlcyBhcmU6JyArXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoaGFuZGxlcnMpLmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHR5cGVDb2RlID0gTWVzc2FnZVR5cGVbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGhhbmRsZXJzW21lc3NhZ2VUeXBlXTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidWZmZXIgPSBuZXcgVWludDhBcnJheShoYW5kbGVyLmJ5dGVDb3VudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhidWZmZXIuYnVmZmVyKSk7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKHNlcmlhbGl6ZXIsIGRhdGEsIGV4dHJhTWFzayk7XHJcbiAgICAgICAgICAgIHZhciBtYXNrID0gaGFuZGxlci5tYXNrQXJyYXkoZGF0YSwgZXh0cmFNYXNrKTtcclxuICAgICAgICAgICAgaWYgKG1hc2subGVuZ3RoIDwgNSkge1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IChtYXNrWzBdIDw8IDApIHwgKG1hc2tbMV0gPDwgOCkgfCAobWFza1syXSA8PCAxNikgfCAobWFza1szXSA8PCAyNCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRhTGVuZ3RoID0gc2VyaWFsaXplci5pbmRleDtcclxuXHJcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBuZXcgVWludDhBcnJheShkYXRhTGVuZ3RoICsgMyk7XHJcbiAgICAgICAgICAgIG91dHB1dFswXSA9IG91dHB1dFsxXSA9IHR5cGVDb2RlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBkYXRhTGVuZ3RoOyArK2lkeCkge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0WzBdIF49IG91dHB1dFtpZHggKyAyXSA9IGJ1ZmZlcltpZHhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dHB1dFtkYXRhTGVuZ3RoICsgMl0gPSAwO1xyXG5cclxuICAgICAgICAgICAgYWNrbm93bGVkZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbWFzazogbWFzayxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGJhY2tlbmQuc2VuZChuZXcgVWludDhBcnJheShjb2JzLmVuY29kZShvdXRwdXQpKSk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxvZ19zZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdTZW5kaW5nIGNvbW1hbmQgJyArIHR5cGVDb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBidXN5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFja2VuZC5idXN5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCeXRlc0hhbmRsZXIoaGFuZGxlcikge1xyXG4gICAgICAgICAgICBieXRlc0hhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChieXRlc0hhbmRsZXIpXHJcbiAgICAgICAgICAgICAgICBieXRlc0hhbmRsZXIoZGF0YSwgcHJvY2Vzc0RhdGEpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb2JzUmVhZGVyLnJlYWRCeXRlcyhkYXRhLCBwcm9jZXNzRGF0YSwgcmVwb3J0SXNzdWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9ydElzc3Vlcyhpc3N1ZSwgdGV4dCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdDT0JTIGRlY29kaW5nIGZhaWxlZCAoJyArIGlzc3VlICsgJyk6ICcgKyB0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZE9uUmVjZWl2ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycyA9IG9uUmVjZWl2ZUxpc3RlbmVycy5jb25jYXQoW2NhbGxiYWNrXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVPblJlY2VpdmVDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMgPSBvblJlY2VpdmVMaXN0ZW5lcnMuZmlsdGVyKGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IgIT09IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFja25vd2xlZGdlKG1hc2ssIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChhY2tub3dsZWRnZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBhY2tub3dsZWRnZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm1hc2sgXiBtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZWplY3QoJ01pc3NpbmcgQUNLJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsYXhlZE1hc2sgPSBtYXNrO1xyXG4gICAgICAgICAgICAgICAgcmVsYXhlZE1hc2sgJj0gfjE7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVsYXhlZE1hc2sgXiB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdSZXF1ZXN0IHdhcyBub3QgZnVsbHkgcHJvY2Vzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzRGF0YShieXRlcykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZUludmVyc2lvbltieXRlc1swXV07XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKClbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICBpZiAoIW1lc3NhZ2VUeXBlIHx8ICFoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdJbGxlZ2FsIG1lc3NhZ2UgdHlwZSBwYXNzZWQgZnJvbSBmaXJtd2FyZScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIsIDEpKTtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gaGFuZGxlci5kZWNvZGUoc2VyaWFsaXplcik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnVW5yZWNvZ25pemVkIG1lc3NhZ2UgZm9ybWF0IHJlY2VpdmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnU3RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gcHJvY2Vzc1N0YXRlSW5wdXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbGFzdF90aW1lc3RhbXBfdXMgPSAwO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzU3RhdGVJbnB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgdmFyIHNlcmlhbF91cGRhdGVfcmF0ZV9IeiA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoJ3RpbWVzdGFtcF91cycgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnNlcmlhbF91cGRhdGVfcmF0ZV9lc3RpbWF0ZSA9IDEwMDAwMDAgLyAoc3RhdGUudGltZXN0YW1wX3VzIC0gbGFzdF90aW1lc3RhbXBfdXMpO1xyXG4gICAgICAgICAgICAgICAgbGFzdF90aW1lc3RhbXBfdXMgPSBzdGF0ZS50aW1lc3RhbXBfdXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlIC89IDEwMC4wOyAgLy8gdGVtcGVyYXR1cmUgZ2l2ZW4gaW4gQ2Vsc2l1cyAqIDEwMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAvPSAyNTYuMDsgIC8vIHByZXNzdXJlIGdpdmVuIGluIChRMjQuOCkgZm9ybWF0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NTdGF0ZU91dHB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlICo9IDEwMC4wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAqPSAyNTYuMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLiRpbmplY3QgPSBbJ2Rlc2NyaXB0b3JzSGFuZGxlciddO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnc2VyaWFsaXphdGlvbkhhbmRsZXInLCBzZXJpYWxpemF0aW9uSGFuZGxlcik7XHJcblxyXG4gICAgZnVuY3Rpb24gc2VyaWFsaXphdGlvbkhhbmRsZXIoZGVzY3JpcHRvcnNIYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXJDYWNoZSA9IHt9O1xyXG5cclxuICAgICAgICB2YXIgbmV3ZXN0VmVyc2lvbiA9IHsgbWFqb3I6IDAsIG1pbm9yOiAwLCBwYXRjaDogMCB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc05ld2VyVmVyc2lvbih2ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIGlmICh2ZXJzaW9uLm1ham9yICE9PSBuZXdlc3RWZXJzaW9uLm1ham9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmVyc2lvbi5tYWpvciA+IG5ld2VzdFZlcnNpb24ubWFqb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZlcnNpb24ubWlub3IgIT09IG5ld2VzdFZlcnNpb24ubWlub3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uLm1pbm9yID4gbmV3ZXN0VmVyc2lvbi5taW5vcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyc2lvbi5wYXRjaCA+IG5ld2VzdFZlcnNpb24ucGF0Y2g7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB2ZXJzaW9uVG9TdHJpbmcodmVyc2lvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmVyc2lvbi5tYWpvci50b1N0cmluZygpICsgJy4nICsgdmVyc2lvbi5taW5vci50b1N0cmluZygpICsgJy4nICsgdmVyc2lvbi5wYXRjaC50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc3RyaW5nVG9WZXJzaW9uKHZlcnNpb24pIHtcclxuICAgICAgICAgICAgdmFyIHBhcnRzID0gdmVyc2lvbi5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbWFqb3I6IHBhcnNlSW50KHBhcnRzWzBdKSxcclxuICAgICAgICAgICAgICAgIG1pbm9yOiBwYXJzZUludChwYXJ0c1sxXSksXHJcbiAgICAgICAgICAgICAgICBwYXRjaDogcGFyc2VJbnQocGFydHNbMl0pLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkSGFuZGxlcih2ZXJzaW9uLCBzdHJ1Y3R1cmUpIHtcclxuICAgICAgICAgICAgaWYgKGlzTmV3ZXJWZXJzaW9uKHZlcnNpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdlc3RWZXJzaW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ham9yOiB2ZXJzaW9uLm1ham9yLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbm9yOiB2ZXJzaW9uLm1pbm9yLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGNoOiB2ZXJzaW9uLnBhdGNoLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyQ2FjaGVbdmVyc2lvblRvU3RyaW5nKHZlcnNpb24pXSA9IEZseWJyaXhTZXJpYWxpemF0aW9uLnBhcnNlKHN0cnVjdHVyZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb3B5SGFuZGxlcih2ZXJzaW9uLCBzcmNWZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05ld2VyVmVyc2lvbih2ZXJzaW9uKSkge1xyXG4gICAgICAgICAgICAgICAgbmV3ZXN0VmVyc2lvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICBtYWpvcjogdmVyc2lvbi5tYWpvcixcclxuICAgICAgICAgICAgICAgICAgICBtaW5vcjogdmVyc2lvbi5taW5vcixcclxuICAgICAgICAgICAgICAgICAgICBwYXRjaDogdmVyc2lvbi5wYXRjaCxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFuZGxlckNhY2hlW3ZlcnNpb25Ub1N0cmluZyh2ZXJzaW9uKV0gPSBoYW5kbGVyQ2FjaGVbdmVyc2lvblRvU3RyaW5nKHNyY1ZlcnNpb24pXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkZXNjVmVyc2lvbnMgPSBkZXNjcmlwdG9yc0hhbmRsZXIudmVyc2lvbnM7XHJcbiAgICAgICAgdmFyIGRlc2NGaWxlcyA9IGRlc2NyaXB0b3JzSGFuZGxlci5maWxlcztcclxuICAgICAgICB2YXIgZGVzY1JldmVyc2VNYXAgPSB7fTtcclxuICAgICAgICBPYmplY3Qua2V5cyhkZXNjVmVyc2lvbnMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciB2ZXJzID0gc3RyaW5nVG9WZXJzaW9uKGtleSk7XHJcbiAgICAgICAgICAgIHZhciBmaWxlbmFtZSA9IGRlc2NWZXJzaW9uc1trZXldO1xyXG4gICAgICAgICAgICBpZiAoZmlsZW5hbWUgaW4gZGVzY1JldmVyc2VNYXApIHtcclxuICAgICAgICAgICAgICAgIGNvcHlIYW5kbGVyKHZlcnMsIGRlc2NSZXZlcnNlTWFwW2ZpbGVuYW1lXSlcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZpbGVuYW1lID0gZGVzY1ZlcnNpb25zW2tleV07XHJcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVyKHZlcnMsIGRlc2NGaWxlc1tmaWxlbmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgZGVzY1JldmVyc2VNYXBbZmlsZW5hbWVdID0gdmVycztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVGaWVsZHModGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlRmllbGRzQXJyYXkodGFyZ2V0LCBzb3VyY2UpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIE9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZUZpZWxkc09iamVjdCh0YXJnZXQsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHNvdXJjZSA9PT0gbnVsbCB8fCBzb3VyY2UgPT09IHVuZGVmaW5lZCkgPyB0YXJnZXQgOiBzb3VyY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkc09iamVjdCh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHRhcmdldCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHVwZGF0ZUZpZWxkcyh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkgaW4gcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB1cGRhdGVGaWVsZHModGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVGaWVsZHNBcnJheSh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgodGFyZ2V0Lmxlbmd0aCwgc291cmNlLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyArK2lkeCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godXBkYXRlRmllbGRzKHRhcmdldFtpZHhdLCBzb3VyY2VbaWR4XSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBTZXJpYWxpemVyOiBGbHlicml4U2VyaWFsaXphdGlvbi5TZXJpYWxpemVyLFxyXG4gICAgICAgICAgICBnZXRIYW5kbGVyOiBmdW5jdGlvbiAoZmlybXdhcmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyQ2FjaGVbZmlybXdhcmVdO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXROZXdlc3RWZXJzaW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3ZXN0VmVyc2lvbjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWRkSGFuZGxlcjogYWRkSGFuZGxlcixcclxuICAgICAgICAgICAgY29weUhhbmRsZXI6IGNvcHlIYW5kbGVyLFxyXG4gICAgICAgICAgICB1cGRhdGVGaWVsZHM6IHVwZGF0ZUZpZWxkcyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIl19
