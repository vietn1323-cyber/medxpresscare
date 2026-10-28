import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Stethoscope, ArrowRight, CheckCircle2, RotateCcw, 
  Sparkles, ShieldCheck, Heart, User, Activity, Flame, 
  Brain, ShoppingBag, Eye, AlertTriangle, Pill, Check,
  MessageSquare, Send, Bot, RefreshCw, Zap, Baby, 
  Briefcase, UserCheck, Droplets, Info, ChevronRight, PhoneCall,
  Clock, Award, HelpCircle
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { consultWithAiPharmacist } from '../utils/aiHelper';

// 1. DANH MỤC 5 ĐỐI TƯỢNG KHÁCH HÀNG CHUYÊN BIỆT
export const ADVISOR_AUDIENCES = [
  { 
    id: 'elderly', 
    title: 'Người Cao Tuổi (Trên 50+)', 
    badge: 'Xương khớp & Tuần hoàn lão hóa',
    desc: 'Đau khớp, khô khớp gối, huyết áp, mỡ máu, mất ngủ kinh niên & tiểu đêm',
    icon: UserCheck,
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    headerColor: 'from-emerald-700 to-teal-800'
  },
  { 
    id: 'women', 
    title: 'Phụ Nữ & Chị Em (25 - 55 tuổi)', 
    badge: 'Trẻ hóa da, Vóc dáng & Nội tiết',
    desc: 'Nám sạm, collagen, nếp nhăn, rối loạn nội tiết, bốc hỏa, mẹ bầu & sau sinh',
    icon: Sparkles,
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    headerColor: 'from-rose-700 to-pink-800'
  },
  { 
    id: 'men', 
    title: 'Nam Giới & Phái Mạnh (25 - 60 tuổi)', 
    badge: 'Bia rượu, Gan thận & Sinh lực',
    desc: 'Tiếp khách nhiều, nóng gan, men gan cao, đau dạ dày, gút & suy giảm sinh lực',
    icon: Flame,
    tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
    headerColor: 'from-blue-700 to-indigo-800'
  },
  { 
    id: 'office', 
    title: 'Dân Văn Phòng & Giới Trẻ (20 - 45 tuổi)', 
    badge: 'Máy tính, Thức khuya & Ít vận động',
    desc: 'Mỏi mắt ánh sáng xanh, đau cổ vai gáy, stress thức khuya, trĩ & táo bón',
    icon: Briefcase,
    tagColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    headerColor: 'from-indigo-700 to-slate-800'
  },
  { 
    id: 'kids', 
    title: 'Trẻ Nhỏ & Học Sinh (Dưới 18 tuổi)', 
    badge: 'Phát triển chiều cao & Đề kháng',
    desc: 'Thấp còi, biếng ăn hấp thu kém, hay ốm vặt giao mùa & cận thị học đường',
    icon: Baby,
    tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
    headerColor: 'from-amber-700 to-orange-800'
  }
];

// 2. MỐI QUAN TÂM SỨC KHỎE ĐƯỢC THIẾT KẾ ĐO NI ĐÓNG GIÀY CHO TỪNG ĐỐI TƯỢNG
export const AUDIENCE_CONCERNS = {
  elderly: [
    {
      id: 'elderly_joint',
      title: 'Đau Nhức Thoái Hóa Khớp, Khô Khớp Gối, Kêu Lục Cục',
      summary: 'Khó khăn khi đứng lên ngồi xuống, leo cầu thang, cứng khớp buổi sáng.',
      mechanism: 'Lớp sụn khớp bị bào mòn theo tuổi tác, bao hoạt dịch giảm tiết dịch nhờn dẫn tới cọ xát đầu xương gây viêm đau.',
      keyNutrients: 'Glucosamine Sulfat/HCL 1500mg, Vỏ Liễu Trắng, Móng Quỷ, MSM, Canxi nano.',
      advice: 'Cần bổ sung hợp chất kháng viêm thực vật lành tính (như Vỏ Liễu Trắng) để cắt cơn đau mà không hại dạ dày, kết hợp Glucosamine tái tạo chất nhờn khớp.',
      lifestyle: 'Tập đi bộ dưỡng sinh nhẹ nhàng 20 phút mỗi ngày. Chườm ấm khớp gối vào buổi tối trước khi đi ngủ.',
      domesticId: 'vn-01', // Viên Khớp Bách Niên Kiện
      importedId: 'us-01', // Glucosamine HCL with MSM Kirkland USA
      category: 'bone_joint'
    },
    {
      id: 'elderly_cardio',
      title: 'Huyết Áp Dao Động, Mỡ Máu Cao & Nguy Cơ Xơ Vữa Tim Mạch',
      summary: 'Thành mạch xơ cứng, cholesterol LDL và triglycerid cao, hay hồi hộp tức ngực.',
      mechanism: 'Các mảng xơ vữa tích tụ làm hẹp lòng động mạch, cản trở lưu thông oxy nuôi tim và tăng nguy cơ đột quỵ.',
      keyNutrients: 'Omega-3 (EPA & DHA tinh khiết), Cao Đinh Lăng, Ginkgo Biloba, Coenzyme Q10.',
      advice: 'Ưu tiên dầu cá không mùi giàu EPA/DHA để dọn sạch mảng bám mỡ máu, bảo vệ thành mạch dẻo dai. Uống đều đặn mỗi ngày sau bữa ăn trưa hoặc sáng.',
      lifestyle: 'Ăn nhạt (giảm muối dưới 5g/ngày), hạn chế mỡ động vật và phủ tạng. Đo huyết áp cố định mỗi sáng.',
      domesticId: 'vn-04', // Cebraton Traphaco
      importedId: 'au-01', // Blackmores Fish Oil 1000mg Úc
      category: 'cardio'
    },
    {
      id: 'elderly_sleep_brain',
      title: 'Mất Ngủ Kinh Niên, Trằn Trọc Khó Vào Giấc, Hay Quên & Tiền Đình',
      summary: 'Chập chờn dễ tỉnh, thức trắng đêm, đau đầu chóng mặt khi thay đổi tư thế.',
      mechanism: 'Thiểu năng tuần hoàn máu não do mạch máu xơ vữa làm giảm oxy nuôi tế bào thần kinh, suy kiệt thụ thể giấc ngủ.',
      keyNutrients: 'Cao Đinh Lăng, Cao Bạch Quả, Magie hữu cơ, Canxi D3, Táo nhân.',
      advice: 'Dùng phức hợp hoạt huyết dưỡng não thảo dược giúp tăng tưới máu vi mạch não, tạo giấc ngủ sinh học êm ái, không gây nhờn thuốc hay mệt mỏi buổi sáng.',
      lifestyle: 'Ngâm chân nước ấm với gừng muối 15 phút trước khi ngủ. Tắt tivi và giữ phòng ngủ thoáng mát, tối.',
      domesticId: 'vn-04', // Cebraton Traphaco
      importedId: 'de-02', // Doppelherz Magie + Canxi + D3 Đức
      category: 'brain_nerve'
    },
    {
      id: 'elderly_kidney_urinary',
      title: 'Thận Âm Hư, Đi Tiểu Đêm Nhiều Lần, Người Mệt Mỏi Sau Ốm',
      summary: 'Đêm thức dậy 3-4 lần đi tiểu làm đứt đoạn giấc ngủ, đau mỏi thắt lưng, gối yếu.',
      mechanism: 'Chức năng lọc cầu thận suy giảm sinh lý, cơ bàng quang co bóp kém và chân khí hư hao sau các đợt ốm.',
      keyNutrients: 'Đông Trùng Hạ Thảo (Adenosine & Cordycepin), Hồng Sâm 6 năm tuổi, Thục Địa.',
      advice: 'Bổ sung thảo dược quý như Đông Trùng Hạ Thảo hoặc Hồng Sâm để đại bổ nguyên khí, bảo vệ tế bào ống thận và kéo dài giấc ngủ xuyên suốt.',
      lifestyle: 'Hạn chế uống nhiều nước canh sau 20h tối. Tuyệt đối không nhịn tiểu và giữ ấm vùng thắt lưng.',
      domesticId: 'vn-02', // Đông Trùng Hạ Thảo Traphaco Sapa
      importedId: 'kr-01', // Nước Hồng Sâm KGC Cheong Kwan Jang Hàn Quốc
      category: 'immunity'
    }
  ],

  women: [
    {
      id: 'women_hormone',
      title: 'Rối Loạn Nội Tiết Tố, Bốc Hỏa, Khô Hạn & Tiền Mãn Kinh',
      summary: 'Thay đổi tâm sinh lý, bốc hỏa từng cơn, cáu gắt vô cớ, suy giảm ham muốn.',
      mechanism: 'Buồng trứng suy giảm sản sinh Estrogen tự nhiên khiến trục Não bộ - Tuyến yên - Buồng trứng mất cân bằng.',
      keyNutrients: 'Tinh dầu Hoa Anh Thảo (GLA 10%), Saponin Sâm Ngọc Linh, Vitamin E tự nhiên.',
      advice: 'Bổ sung Axit Gamma-Linolenic (GLA) từ Hoa Anh Thảo ép lạnh giúp kích hoạt cơ chế điều hòa nội tiết tố nội sinh, giảm nhanh các cơn bốc hỏa và cải thiện tiết dịch tự nhiên.',
      lifestyle: 'Tập Yoga hoặc ngồi thiền 20 phút mỗi ngày. Uống đủ 2 lít nước và ăn nhiều rau củ quả xanh.',
      domesticId: 'vn-05', // Sâm Ngọc Linh K5
      importedId: 'au-03', // Tinh Dầu Hoa Anh Thảo Blackmores EPO Úc
      category: 'womens_health'
    },
    {
      id: 'women_skin_aging',
      title: 'Nám Chân Sâu, Tàn Nhang, Da Chảy Xệ & Nếp Nhăn Lão Hóa',
      summary: 'Da xỉn màu thiếu sức sống, xuất hiện nám mảng hai bên gò má, mất độ đàn hồi sau 28 tuổi.',
      mechanism: 'Tia UV và gốc tự do kích hoạt enzym Tyrosinase sản sinh hắc sắc tố Melanin, làm đứt gãy lưới sợi collagen mô liên kết.',
      keyNutrients: 'Chiết xuất Ý dĩ (Coix), Nano Curcumin tinh khiết 98%, Vitamin C hữu cơ.',
      advice: 'Liệu trình kết hợp trong uống ngoài dưỡng: Dùng tinh chất Ý dĩ cô đặc ức chế tận gốc tế bào hắc tố Melanin và kích thích sản sinh collagen tuýp 1 săn chắc.',
      lifestyle: 'Thoa kem chống nắng phổ rộng SPF 50+ mỗi ngày kể cả khi ở trong nhà. Ăn nhiều quả mọng giàu chất chống oxy hóa.',
      domesticId: 'vn-03', // Tinh Nghệ Nano Curcumin OIC New
      importedId: 'jp-01', // Viên Trắng Da DHC Coix Extract Ý Dĩ Nhật Bản
      category: 'beauty_skin'
    },
    {
      id: 'women_body_shape',
      title: 'Tích Mỡ Vùng Bụng, Đầy Hơi Chậm Tiêu, Cần Thải Độc & Vóc Dáng',
      summary: 'Vòng 2 tăng kích thước sau sinh hoặc ngồi văn phòng, tiêu hóa ì ạch, trao đổi chất kém.',
      mechanism: 'Chỉ số trao đổi chất BMR chậm lại khiến năng lượng dư thừa tích tụ thành mô mỡ trắng nội tạng khó đào thải.',
      keyNutrients: 'Trà thảo mộc thải độc ban đêm, Dây thìa canh, Diệp lục tố, L-Carnitine.',
      advice: 'Dùng trà thảo mộc thiên nhiên uống ấm trước khi ngủ để tăng cường đốt cháy lipid tự nhiên lúc nghỉ ngơi và đào thải cặn bã trong thành ruột mà không gây mất nước.',
      lifestyle: 'Hạn chế ăn tối sau 19h30, kiêng đồ ngọt và tinh bột trắng. Đi bộ 30 phút vào buổi tối.',
      domesticId: 'vn-07', // Dây Thìa Canh Nam Dược
      importedId: 'jp-04', // Trà Giảm Cân Ban Đêm Orihiro Night Diet Tea Nhật
      category: 'weight_loss'
    },
    {
      id: 'women_pregnancy_postpartum',
      title: 'Bổ Sung Canxi & Dưỡng Chất Toàn Diện Cho Mẹ Bầu & Sau Sinh',
      summary: 'Cần canxi không gây nóng trong hay táo bón, phục hồi sức khỏe và tăng chất lượng sữa.',
      mechanism: 'Thai nhi và trẻ sơ sinh rút canxi trực tiếp từ hệ xương mẹ; nhu cầu dinh dưỡng vi lượng tăng vọt gấp 2 lần.',
      keyNutrients: 'Canxi sữa hữu cơ Hydroxyapatite, Vitamin D3 & K2 MK-7, Đông trùng hạ thảo.',
      advice: 'Tuyệt đối chọn Canxi hữu cơ gốc sữa kết hợp vitamin D3 & K2 MK-7 để dẫn canxi trúng đích vào xương mẹ và bé, tránh vôi hóa bánh nhau.',
      lifestyle: 'Uống nhiều nước ấm, chia nhỏ bữa ăn. Duy trì tâm lý vui vẻ, nghỉ ngơi đầy đủ giữa các cữ chăm con.',
      domesticId: 'vn-02', // Đông Trùng Hạ Thảo Traphaco Sapa
      importedId: 'au-02', // Canxi Hữu Cơ Bio Island Milk Calcium Úc
      category: 'kids_mom'
    }
  ],

  men: [
    {
      id: 'men_liver_alcohol',
      title: 'Nóng Gan, Men Gan Cao, Thường Xuyên Bia Rượu & Mẩn Ngứa',
      summary: 'Hay nổi mề đay ngứa ngáy, đắng miệng buổi sáng, người bứt rứt sau các buổi liên hoan.',
      mechanism: 'Cồn ethanol chuyển hóa thành chất độc Acetaldehyde phá hủy màng tế bào gan, gây tích tụ mỡ gan và tăng men ALT/AST.',
      keyNutrients: 'Silymarin chiết xuất Kế Sữa (Milk Thistle) 1000mg, Nano Curcumin, Artichoke.',
      advice: 'Silymarin liều chuẩn 1000mg giúp ổn định màng tế bào gan, kích thích tổng hợp protein phục hồi nhu mô gan và trung hòa độc tố cồn cấp tốc.',
      lifestyle: 'Uống 1 cốc nước ấm lớn trước khi đi nhậu. Uống tối thiểu 2.5 lít nước mỗi ngày để hỗ trợ gan thận bài tiết độc tố.',
      domesticId: 'vn-03', // Tinh Nghệ Nano Curcumin OIC New
      importedId: 'us-02', // Milk Thistle Silymarin 1000mg Now Foods USA
      category: 'digestive_liver'
    },
    {
      id: 'men_vitality',
      title: 'Suy Giảm Sinh Lực Phái Mạnh, Mãn Dục Nam Sớm, Đau Lưng Mỏi Gối',
      summary: 'Cơ thể nhanh mệt mỏi, giảm ham muốn, tinh lực suy sút sau tuổi 35 do áp lực công việc.',
      mechanism: 'Nồng độ Testosterone tự do trong máu sụt giảm từ 1-2% mỗi năm sau tuổi 30, kéo theo sự thoái biến của chức năng tuyến thượng thận.',
      keyNutrients: 'Bổ Thận Đông Y gia truyền, Saponin Sâm Ngọc Linh, Hồng Sâm Hàn Quốc 6 năm tuổi.',
      advice: 'Bổ sung thảo dược bổ thận tráng dương phối ngũ ngũ vị giúp bồi đắp chân khí, kích thích tinh hoàn sản sinh testosterone nội sinh bền vững mà không gây tác dụng phụ.',
      lifestyle: 'Ngủ đủ giấc trước 23h, hạn chế thức khuya. Tập thể dục tăng cơ bắp 3-4 buổi mỗi tuần.',
      domesticId: 'vn-06', // Bổ Thận Âm Nam Dược
      importedId: 'kr-01', // Nước Hồng Sâm KGC Cheong Kwan Jang
      category: 'mens_health'
    },
    {
      id: 'men_stomach_acid',
      title: 'Đau Rát Thượng Vị, Viêm Loét Dạ Dày, Ợ Chua & Trào Ngược',
      summary: 'Đau tức vùng thượng vị khi đói hoặc sau ăn cay nóng, trào ngược dịch acid lên cổ họng.',
      mechanism: 'Mất cân bằng giữa yếu tố tấn công (Acid HCl, Pepsin, Vi khuẩn HP) và yếu tố bảo vệ (Chất nhầy niêm mạc Mucin).',
      keyNutrients: 'Nano Curcumin siêu hấp thu (hạt <39nm), Tảo xoắn kiềm hóa dịch vị, Piperine.',
      advice: 'Nano Curcumin bao phủ ổ viêm loét, kháng khuẩn HP và kích thích tái tạo nhanh niêm mạc tổn thương. Giảm đau rát nhanh chóng sau 15-30 phút.',
      lifestyle: 'Ăn đúng giờ, tuyệt đối không bỏ bữa sáng. Kiêng đồ cay nóng, cà phê đặc và rượu bia lúc đói.',
      domesticId: 'vn-03', // Tinh Nghệ Nano Curcumin OIC New
      importedId: 'jp-02', // Tảo Xoắn Vàng Spirulina EX Nhật Bản
      category: 'digestive_liver'
    },
    {
      id: 'men_gout_uric',
      title: 'Axit Uric Tăng Cao, Đau Nhức Khớp Ngón Chân Ngón Tay Do Gút',
      summary: 'Cơn đau khớp ngón chân cái sưng nóng đỏ dữ dội sau bữa ăn nhiều đạm hoặc hải sản.',
      mechanism: 'Acid Uric bão hòa kết tinh thành các tinh thể hình kim Urat lắng đọng trong bao hoạt dịch khớp gây viêm cấp tính.',
      keyNutrients: 'Chiết xuất Móng Quỷ, Vỏ Liễu Trắng (Harpagoside), Glucosamine & MSM.',
      advice: 'Ức chế phản ứng viêm sưng bằng hoạt chất tự nhiên từ Móng Quỷ, đồng thời thanh lọc acid uric dư thừa ra khỏi cơ thể qua đường bài tiết.',
      lifestyle: 'Kiêng tuyệt đối nội tạng động vật, thịt đỏ và bia rượu trong đợt đau cấp. Uống nhiều nước khoáng kiềm.',
      domesticId: 'vn-01', // Viên Khớp Bách Niên Kiện
      importedId: 'us-01', // Glucosamine HCL with MSM Kirkland USA
      category: 'bone_joint'
    }
  ],

  office: [
    {
      id: 'office_eyes',
      title: 'Mỏi Mắt, Khô Rát Mắt, Giảm Thị Lực Do Màn Hình Máy Tính 8-10 Giờ',
      summary: 'Mắt cay rát, hay chảy nước mắt sống, mờ nhòe về chiều tối do nhìn màn hình liên tục.',
      mechanism: 'Ánh sáng xanh có năng lượng cao xuyên qua giác mạc phá hủy tế bào sắc tố hoàng điểm Lutein ở võng mạc.',
      keyNutrients: 'Lutein quang học 16mg, Zeaxanthin, Tinh chất Việt quất, Dầu cá Omega-3.',
      advice: 'Bổ sung 1 viên Lutein tự nhiên mỗi ngày để tái lập lớp khiên chắn ánh sáng xanh của điểm vàng, bảo vệ thị lực mắt luôn trong sáng tinh anh.',
      lifestyle: 'Áp dụng quy tắc 20-20-20: Cứ 20 phút nhìn màn hình thì nhìn xa 6 mét trong 20 giây. Chớp mắt thường xuyên.',
      domesticId: 'vn-04', // Cebraton Traphaco (Tăng tuần hoàn võng mạc)
      importedId: 'jp-03', // Viên Uống Bổ Mắt DHC Lutein Nhật Bản
      category: 'eye_care'
    },
    {
      id: 'office_neck_shoulder',
      title: 'Đau Cứng Cổ Vai Gáy, Tê Mỏi Cánh Tay, Co Thắt Bó Cơ Do Ngồi Lâu',
      summary: 'Cổ quay khó khăn, đau nhức bả vai lan xuống tay, chuột rút tê buốt các đầu ngón tay.',
      mechanism: 'Tư thế ngồi cúi đầu nhìn máy tính liên tục gây co thắt cục bộ mạch máu nuôi dưỡng bó cơ thang vai và chèn ép rễ thần kinh cổ.',
      keyNutrients: 'Magie hữu cơ liều cao, Canxi, Vitamin B1-B6-B12, Chiết xuất thảo dược giãn cơ.',
      advice: 'Magie kết hợp Canxi và vitamin nhóm B là giải pháp giãn cơ sinh học tuyệt vời, giúp giải phóng co cứng bó cơ vân và chấm dứt đau cứng cổ tức thì.',
      lifestyle: 'Chỉnh ghế ngồi sao cho khuỷu tay vuông góc bàn phím, màn hình ngang tầm mắt. Đứng dậy vươn vai sau mỗi 60 phút.',
      domesticId: 'vn-01', // Viên Khớp Bách Niên Kiện
      importedId: 'de-02', // Doppelherz Magie + Canxi + D3 Đức
      category: 'bone_joint'
    },
    {
      id: 'office_stress_burnout',
      title: 'Stress Căng Thẳng, Não Bộ Kiệt Sức, Thức Khuya Khó Tập Trung',
      summary: 'Đầu óc căng thẳng vì deadline, sáng dậy lờ đờ thiếu năng lượng, suy giảm trí nhớ công việc.',
      mechanism: 'Nồng độ Cortisol căng thẳng tăng vọt kéo dài ức chế tái tạo nơ-ron thần kinh và làm suy giảm chất dẫn truyền thần kinh Serotonin.',
      keyNutrients: 'Cao Đinh Lăng, Ginkgo Biloba, Omega-3 DHA tinh khiết, Hồng Sâm.',
      advice: 'Dùng dầu cá giàu DHA tinh khiết để bọc màng dẫn truyền tế bào não kết hợp thảo dược hoạt huyết giúp tăng sóng não alpha thư thái tập trung.',
      lifestyle: 'Tập thở sâu bụng 5 phút khi căng thẳng. Hạn chế lướt điện thoại trên giường trước khi đi ngủ.',
      domesticId: 'vn-04', // Cebraton Traphaco
      importedId: 'au-01', // Blackmores Fish Oil 1000mg Úc
      category: 'brain_nerve'
    },
    {
      id: 'office_constipation_gut',
      title: 'Ngồi Nhiều Ít Vận Động, Táo Bón Kinh Niên, Đầy Hơi & Nguy Cơ Trĩ',
      summary: '2-3 ngày mới đi vệ sinh một lần, phân khô rát khó rặn, bụng chướng đầy khó chịu.',
      mechanism: 'Nhu động ruột giảm do ít vận động kết hợp uống không đủ nước và chế độ ăn thiếu chất xơ vi sinh prebiotic.',
      keyNutrients: 'Tảo xoắn Spirulina chứa 2 tỷ lợi khuẩn Lactic Acid Bacilli, Nano Curcumin.',
      advice: 'Tảo xoắn Spirulina Nhật Bản cung cấp nguồn chất xơ diệp lục khổng lồ cùng bào tử lợi khuẩn giúp bôi trơn đại tràng, làm mềm phân tự nhiên mà không gây lệ thuộc thuốc nhuận tràng.',
      lifestyle: 'Đặt 1 bình nước 1.5 lít tại bàn làm việc và uống từng ngụm nhỏ. Ăn thêm khoai lang, đu đủ chín và sữa chua.',
      domesticId: 'vn-03', // Tinh Nghệ Nano Curcumin OIC New
      importedId: 'jp-02', // Tảo Xoắn Vàng Spirulina EX Nhật Bản
      category: 'digestive_liver'
    }
  ],

  kids: [
    {
      id: 'kids_height',
      title: 'Trẻ Thấp Còi, Chậm Tăng Chiều Cao Trong Giai Đoạn Vàng',
      summary: 'Thấp hơn chuẩn chiều cao WHO so với bạn bè cùng lớp, răng mọc chậm, hay đau mỏi xương.',
      mechanism: 'Cơ thể thiếu hụt Canxi ion hữu cơ và vi chất dẫn đường Vitamin K2 (MK-7) đưa canxi trực tiếp vào sụn tăng trưởng.',
      keyNutrients: 'Canxi sữa Hydroxyapatite tự nhiên từ bò sữa, Vitamin D3 và K2 MK-7 tinh khiết.',
      advice: 'Canxi chiết xuất từ sữa tươi hữu cơ có tỷ lệ Canxi:Phospho 2:1 lý tưởng tương thích sinh học cao nhất, kết hợp vitamin K2 dạng MK-7 giúp canxi gắn chặt vào khuôn xương.',
      lifestyle: 'Khuyến khích bé bơi lội, chơi bóng rổ, nhảy dây 30 phút mỗi ngày. Cho bé đi ngủ sâu giấc trước 22h.',
      domesticId: 'vn-01', // Hỗ trợ xương khớp
      importedId: 'au-02', // Canxi Sữa Tảo Biển Bio Island Milk Calcium Úc
      category: 'bone_joint'
    },
    {
      id: 'kids_appetite_digestion',
      title: 'Trẻ Biếng Ăn, Hấp Thu Kém, Chậm Tăng Cân, Tiêu Hóa Non Yếu',
      summary: 'Mỗi bữa ăn kéo dài cả tiếng, ngậm thức ăn, hay nôn trớ và bụng chướng đầy.',
      mechanism: 'Niêm mạc ruột non chưa hoàn thiện, enzym tiêu hóa tiết ít, thiếu hụt khoáng chất kẽm và acid amin thiết yếu kích thích vị giác.',
      keyNutrients: 'Acid amin quý từ Đông Trùng Hạ Thảo hữu cơ, Vi chất dinh dưỡng từ Tảo Spirulina.',
      advice: 'Bổ sung acid amin tự nhiên và khoáng chất vi lượng giúp kích thích gai vị giác ở lưỡi, trẻ sẽ tự động có cảm giác thèm ăn và hấp thu tối đa dưỡng chất từ thức ăn gia đình.',
      lifestyle: 'Chia nhỏ bữa ăn, đổi mới thực đơn phong phú. Tuyệt đối không cho xem tivi hoặc điện thoại khi đang ăn.',
      domesticId: 'vn-02', // Đông Trùng Hạ Thảo Sapa Traphaco
      importedId: 'jp-02', // Tảo Xoắn Vàng Spirulina EX Nhật Bản
      category: 'immunity'
    },
    {
      id: 'kids_immunity_flu',
      title: 'Hay Ốm Vặt, Viêm Đường Hô Hấp, Ho Sổ Mũi Khi Thay Đổi Thời Tiết',
      summary: 'Cứ giao mùa là ho sốt, sổ mũi, viêm họng, một năm phải dùng kháng sinh nhiều đợt.',
      mechanism: 'Hệ thống kháng thể bẩm sinh IgA, IgG còn non nớt, tuyến ức chưa trưởng thành đầy đủ.',
      keyNutrients: 'Thymomodulin tinh khiết, Kẽm Gluconate, Vitamin C, Siro thảo dược Bạch Bộ.',
      advice: 'Thymomodulin chuẩn Đức giúp kích thích tuyến ức sản sinh tế bào miễn dịch Lympho T đặc hiệu, tạo lá chắn phòng ngừa viêm phế quản và viêm đường hô hấp hiệu quả gấp 3 lần.',
      lifestyle: 'Giữ ấm cổ ngực và gan bàn chân cho bé. Rửa mũi họng bằng nước muối sinh lý ấm sau khi đi học về.',
      domesticId: 'vn-08', // Siro Bổ Phổi Bạch Bộ DHG
      importedId: 'de-01', // Doppelherz Aktiv Kinder Thymo Đức
      category: 'kids_mom'
    },
    {
      id: 'kids_eyes_brain',
      title: 'Cận Thị Học Đường, Mỏi Mắt, Cần Tăng Trí Nhớ & Tập Trung Học Thi',
      summary: 'Học nhiều bài vở, dùng máy tính học trực tuyến nhiều, hay nheo mắt dụi mắt, học mau quên.',
      mechanism: 'Mắt điều tiết liên tục ở cự ly gần gây co quắp cơ thể mi, tế bào não thiếu hụt dưỡng chất lưu thông vi mạch.',
      keyNutrients: 'Lutein quang học, Omega-3 DHA, Tinh chất Đinh Lăng & Bạch Quả.',
      advice: 'Bổ sung Lutein tự nhiên bảo vệ điểm vàng và dưỡng chất lưu thông máu não giúp tế bào não phản xạ nhanh, nhớ bài lâu và thị lực luôn sáng rõ.',
      lifestyle: 'Học ở bàn học có ánh sáng tự nhiên đầy đủ. Sau 45 phút học tập cho mắt nghỉ ngơi 5 phút nhìn ra cây xanh.',
      domesticId: 'vn-04', // Cebraton Traphaco
      importedId: 'jp-03', // Viên Uống Bổ Mắt DHC Lutein Nhật Bản
      category: 'eye_care'
    }
  ]
};

// 3. DANH MỤC TIỀN SỬ BỆNH LÝ & TƯƠNG TÁC THUỐC
export const ADVISOR_CONDITIONS = [
  { 
    id: 'none', 
    title: 'Cơ thể khỏe mạnh, không dùng thuốc đặc trị nào', 
    desc: 'Không có bệnh lý nền, tiêu hóa và huyết áp bình thường', 
    note: 'Không có tương tác thuốc bất lợi. Sử dụng đúng liều lượng khuyến cáo trên nhãn sau bữa ăn.' 
  },
  { 
    id: 'stomach', 
    title: 'Tiền sử Đau dạ dày / Viêm loét / Trào ngược dạ dày thực quản', 
    desc: 'Dễ ợ chua, xót ruột khi uống thuốc hoặc khi bụng đói', 
    note: 'LƯU Ý DƯỢC SĨ: Luôn uống các sản phẩm bổ sung sau bữa ăn no khoảng 30 phút cùng 1 ly nước ấm đầy. Tuyệt đối không uống lúc bụng đói để tránh kích ứng niêm mạc dạ dày.' 
  },
  { 
    id: 'blood_pressure', 
    title: 'Đang dùng thuốc Tây điều trị Huyết áp / Tim mạch hàng ngày', 
    desc: 'Uống thuốc hạ áp (Amlodipin, Losartan, Enalapril,...) theo đơn bác sĩ', 
    note: 'LƯU Ý DƯỢC SĨ: Thực phẩm chức năng không thay thế thuốc kê đơn. Uống TPCN cách cữ thuốc huyết áp ít nhất 1.5 - 2 giờ để tránh tương tác hấp thu.' 
  },
  { 
    id: 'diabetes', 
    title: 'Tiền sử Đường huyết cao / Đang điều trị Tiểu đường', 
    desc: 'Cần kiểm soát chặt chẽ chỉ số đường huyết HbA1c và carbohydrate', 
    note: 'LƯU Ý DƯỢC SĨ: Các sản phẩm được Dược sĩ đề xuất đều là dạng viên chuẩn hóa, không chứa đường Saccarozo tự do. Đo đường huyết định kỳ để theo dõi hiệu quả.' 
  },
  { 
    id: 'calcium_iron', 
    title: 'Đang uống bổ sung thêm viên Canxi hoặc Sắt dạng khoáng chất', 
    desc: 'Bổ sung khoáng vi lượng đơn chất hàng ngày', 
    note: 'LƯU Ý DƯỢC SĨ: Uống cách viên Canxi hoặc viên Sắt ít nhất 2 giờ vì các ion kim loại có thể tạo phức Chelate làm giảm hấp thu các hoạt chất thảo dược.' 
  }
];

export const HealthAdvisorModal = ({ 
  onClose, 
  onAddToCart, 
  onOpenDetail, 
  products = PRODUCTS,
  storeConfig = {}
}) => {
  // Chế độ tư vấn: 'wizard' (Khảo sát 4 bước) hoặc 'chat' (Trò chuyện trực tiếp với Dược sĩ AI 24/7)
  const [activeTab, setActiveTab] = useState('wizard');

  // Trạng thái Wizard
  const [step, setStep] = useState(1);
  const [selectedAudienceId, setSelectedAudienceId] = useState('elderly');
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [selectedConditionId, setSelectedConditionId] = useState('none');

  // Ngữ cảnh tư vấn riêng cho khung Chat (Người dùng chủ động chọn hoặc để AI tự động nhận diện)
  const [chatAudience, setChatAudience] = useState('auto'); // 'auto' | 'elderly' | 'women' | 'men' | 'office' | 'kids'
  const [chatCondition, setChatCondition] = useState('none'); // 'none' | 'stomach' | 'blood_pressure' | 'diabetes'

  // Trạng thái Live Chat AI
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'pharmacist',
      text: `Xin chào quý khách! Tôi là **Dược sĩ Lâm Sàng MedXpressCare**.

Tôi ở đây để lắng nghe và đồng hành cùng quý khách về mọi vấn đề sức khỏe:
🌿 Giải đáp thắc mắc về triệu chứng, cơ chế bệnh học và chế độ ăn uống, kiêng cữ
💊 Hướng dẫn thời điểm uống, cách dùng và kiểm tra tương tác thuốc, bệnh nền an toàn
🩺 Tư vấn liệu trình bổ sung vi chất & dược mỹ phẩm chuyên sâu (kết hợp giải pháp nội địa & nhập khẩu chính ngạch khi quý khách cần)

Quý khách đang gặp tình trạng khó chịu nào hoặc cần Dược sĩ hỗ trợ thông tin gì ạ?`,
      recommendedProducts: [],
      precautions: '',
      time: 'Vừa xong'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất trong khung chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isThinking]);

  // Tìm đối tượng & mối quan tâm hiện tại
  const currentAudience = ADVISOR_AUDIENCES.find(a => a.id === selectedAudienceId) || ADVISOR_AUDIENCES[0];
  const currentConcernsList = AUDIENCE_CONCERNS[selectedAudienceId] || AUDIENCE_CONCERNS.elderly;
  const activeConcern = selectedConcern || currentConcernsList[0];
  const activeCondition = ADVISOR_CONDITIONS.find(c => c.id === selectedConditionId) || ADVISOR_CONDITIONS[0];

  // Sản phẩm đề xuất cho bước 4
  const matchesConcernCategory = (p, cat) => {
    if (!cat) return false;
    if (Array.isArray(p.categories) && p.categories.length > 0) return p.categories.includes(cat);
    return p.category === cat;
  };

  const domesticProduct = products.find(p => p.id === activeConcern.domesticId) || 
                          products.find(p => matchesConcernCategory(p, activeConcern.category) && p.originType === 'domestic') || 
                          products[0];
  const importedProduct = products.find(p => p.id === activeConcern.importedId) || 
                          products.find(p => matchesConcernCategory(p, activeConcern.category) && p.originType === 'imported') || 
                          products[6] || products[1];

  // Handlers cho Wizard
  const handleSelectAudience = (audienceId) => {
    setSelectedAudienceId(audienceId);
    setSelectedConcern(null); // Reset concern when audience changes
    setStep(2);
  };

  const handleSelectConcern = (concernItem) => {
    setSelectedConcern(concernItem);
    setStep(3);
  };

  const handleSelectCondition = (condId) => {
    setSelectedConditionId(condId);
    setStep(4);
  };

  const handleResetWizard = () => {
    setStep(1);
    setSelectedAudienceId('elderly');
    setSelectedConcern(null);
    setSelectedConditionId('none');
  };

  // Helper thêm combo vào giỏ hàng với chiết khấu
  const handleAddComboToCart = (prod, boxes = 3, discountPercent = 10) => {
    if (!prod) return;
    const unitPrice = Math.round(prod.price * (1 - discountPercent / 100));
    const totalPrice = unitPrice * boxes;
    const comboItem = {
      ...prod,
      id: `${prod.id}-combo${boxes}`,
      name: `${prod.name} (Liệu Trình ${boxes} Hộp Chuẩn)`,
      price: totalPrice,
      originalPrice: prod.price * boxes,
      comboType: `combo${boxes}`,
      comboTitle: `Combo Liệu Trình ${boxes} Hộp (-${discountPercent}%)`,
      comboBoxes: boxes
    };
    onAddToCart(comboItem, 1);
    onClose();
  };

  // Handlers cho Live Chat AI
  const handleSendMessage = async (customText = null) => {
    const textToSend = typeof customText === 'string' ? customText : chatInput;
    if (!textToSend.trim() || isThinking) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsThinking(true);

    try {
      const response = await consultWithAiPharmacist({
        userMessage: textToSend.trim(),
        targetAudience: chatAudience === 'auto' ? '' : chatAudience,
        selectedConcern: selectedConcern, // Không ép về activeConcern nếu chưa chọn
        selectedCondition: chatCondition,
        products: products,
        apiKey: storeConfig?.aiApiKey || '',
        provider: storeConfig?.aiProvider || 'gemini',
        model: storeConfig?.aiModel || 'gemini-2.5-flash',
        chatHistory: chatMessages
      });

      // Lấy danh sách sản phẩm khớp từ ID trả về (CHỈ khi AI có đề xuất)
      const matchedProds = (Array.isArray(response.recommendedProductIds) && response.recommendedProductIds.length > 0)
        ? response.recommendedProductIds.map(id => products.find(p => p.id === id)).filter(Boolean)
        : [];

      const aiMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'pharmacist',
        text: response.reply,
        recommendedProducts: matchedProds, // Tuyệt đối không tự ý ép sản phẩm khi khách chưa cần!
        precautions: response.precautions,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-' + (Date.now() + 1),
          sender: 'pharmacist',
          text: `Dược sĩ MedXpressCare đã nhận được câu hỏi của bạn: "${textToSend}". Hiện tại kênh tư vấn trực tuyến đang bận trong giây lát. Để được tư vấn chi tiết và chuẩn xác nhất cho tình trạng của mình, bạn có thể gọi trực tiếp đến Tổng đài Dược sĩ Lâm Sàng miễn cước **${storeConfig?.hotline || '1800 6868'}** để được hỗ trợ ngay nhé!`,
          recommendedProducts: [],
          precautions: '',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Câu hỏi gợi ý nhanh đa dạng theo nhu cầu thực tế
  const QUICK_PROMPTS = [
    { label: '🌿 Đau khớp gối nên kiêng ăn gì & tập bài gì?', query: 'Cho tôi hỏi người bị đau khớp gối và thoái hóa khớp thì nên kiêng ăn những món gì và có bài tập nào tập tại nhà không?' },
    { label: '⏰ Uống Canxi và Dầu cá vào lúc nào tốt nhất?', query: 'Dược sĩ cho tôi hỏi Canxi và Dầu cá Omega-3 nên uống vào thời điểm nào trong ngày để hấp thu tốt nhất?' },
    { label: '💊 Đang uống thuốc huyết áp dùng TPCN được không?', query: 'Bác đang uống thuốc điều trị huyết áp hàng ngày, nếu muốn dùng thêm thảo dược bổ não thì có cần lưu ý gì không?' },
    { label: '🧓 Bác 65 tuổi bị thoái hóa khớp gối, tư vấn liệu trình', query: 'Bác năm nay 65 tuổi bị thoái hóa khớp gối đau nhức đi lại lục cục, tư vấn giúp bác sản phẩm hỗ trợ tái tạo sụn khớp an toàn cho dạ dày' },
    { label: '💼 Dân văn phòng ngồi máy tính hay bị khô mỏi mắt', query: 'Em làm văn phòng ngồi máy tính 8-10 tiếng mỗi ngày, mắt hay bị khô rát mỏi nhòe thì nên cải thiện thế nào?' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-4 max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-6 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-emerald-200 shadow-inner">
                <Stethoscope className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Dược Sĩ Lâm Sàng AI 24/7
                  </span>
                  <span className="bg-emerald-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping"></span>
                    Trực Tuyến 24/7
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black mt-0.5">
                  Tư Vấn Chuẩn Y Khoa Theo Từng Đối Tượng & Nhu Cầu
                </h2>
              </div>
            </div>

            {/* TAB CHUYỂN ĐỔI CHẾ ĐỘ (Wizard vs Live Chat) */}
            <div className="flex items-center bg-black/25 p-1 rounded-xl self-start sm:self-auto border border-white/10 text-xs font-bold">
              <button
                onClick={() => setActiveTab('wizard')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'wizard' 
                    ? 'bg-white text-emerald-900 shadow font-extrabold' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Khảo Sát Nhu Cầu</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-amber-400 text-slate-900 shadow font-black' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Trò Chuyện AI 24/7</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-0.5"></span>
              </button>
            </div>
          </div>

          
        {/* BANNER BẢO VỆ PHÁP LÝ & PHẠM VI HOẠT ĐỘNG */}
        <div className="bg-amber-50/90 border-b border-amber-200/90 px-4 py-2 flex items-center gap-2 text-[11px] sm:text-xs text-amber-900 font-medium">
          <span className="font-black text-amber-800 uppercase bg-amber-200/80 px-2 py-0.5 rounded text-[10px] shrink-0">
            Lưu Ý Y Tế
          </span>
          <span className="leading-tight">
            MedXpressCare chỉ cung cấp <strong>Thực phẩm bảo vệ sức khỏe (TPCN) & Dược mỹ phẩm</strong>. Website <strong>KHÔNG BÁN THUỐC KÊ ĐƠN</strong> và không cung cấp phác đồ điều trị thay thế chẩn đoán của Bác sĩ.
          </span>
        </div>

          {/* Stepper Indicator nếu đang ở Wizard Mode */}
          {activeTab === 'wizard' && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div 
                    key={s} 
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                      step >= s ? 'bg-amber-400' : 'bg-white/20'
                    }`} 
                  />
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-emerald-100/90 mt-1.5 font-semibold">
                <span className={step === 1 ? 'text-amber-300 font-bold' : ''}>1. Chọn Đối Tượng</span>
                <span className={step === 2 ? 'text-amber-300 font-bold' : ''}>2. Mối Quan Tâm</span>
                <span className={step === 3 ? 'text-amber-300 font-bold' : ''}>3. Bệnh Nền / Thuốc</span>
                <span className={step === 4 ? 'text-amber-300 font-bold' : ''}>4. Liệu Trình Bổ Sung</span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* NỘI DUNG TAB 1: KHẢO SÁT PHÁC ĐỒ THEO BƯỚC (WIZARD)          */}
        {/* ============================================================== */}
        {activeTab === 'wizard' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            
            {/* BƯỚC 1: CHỌN ĐỐI TƯỢNG (5 NHÓM ĐỐI TƯỢNG) */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span>Bước 1: Quý khách đang tìm kiếm giải pháp sức khỏe cho ai?</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Dược sĩ sẽ tự động tải danh sách các mối quan tâm và bệnh lý thường gặp nhất của đối tượng này.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ADVISOR_AUDIENCES.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = selectedAudienceId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectAudience(item.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all group flex flex-col justify-between hover:shadow-md relative overflow-hidden ${
                          isSelected 
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' 
                            : 'border-slate-200/90 hover:border-emerald-500 hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.tagColor}`}>
                              {item.badge}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              <IconComponent className="w-4 h-4" />
                            </div>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                          <span>Xem 4 mối quan tâm hàng đầu</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BƯỚC 2: CHỌN MỐI QUAN TÂM SỨC KHỎE (LỌC THEO ĐỐI TƯỢNG ĐÃ CHỌN) */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Đối tượng: {currentAudience.title}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      Bước 2: Mối quan tâm sức khỏe nào cần ưu tiên cải thiện nhất?
                    </h3>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Đổi đối tượng
                  </button>
                </div>

                <div className="space-y-3">
                  {currentConcernsList.map((concern) => (
                    <button
                      key={concern.id}
                      onClick={() => handleSelectConcern(concern)}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200/90 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group flex items-start justify-between bg-white hover:shadow-md"
                    >
                      <div className="space-y-1.5 pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700">
                            {concern.title}
                          </h4>
                        </div>
                        
                        <p className="text-xs text-slate-600 font-medium">
                          <strong>Triệu chứng:</strong> {concern.summary}
                        </p>
                        
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          <strong>Cơ chế dược lý:</strong> {concern.mechanism}
                        </p>

                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 mt-1">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>Dưỡng chất chìa khóa: {concern.keyNutrients}</span>
                        </div>
                      </div>

                      <div className="shrink-0 self-center">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all group-hover:scale-105">
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BƯỚC 3: KIỂM TRA BỆNH LÝ NỀN & TƯƠNG TÁC THUỐC */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-emerald-600" />
                      <span>Bước 3: Kiểm Tra Tương Tác Thuốc & Bệnh Lý Nền</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Để Dược sĩ tư vấn thời điểm uống an toàn và tránh cản trở hấp thu, người dùng có đang dùng thuốc gì không?
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 shrink-0 ml-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Quay lại
                  </button>
                </div>

                <div className="space-y-2.5">
                  {ADVISOR_CONDITIONS.map((cond) => (
                    <button
                      key={cond.id}
                      onClick={() => handleSelectCondition(cond.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                        cond.id === 'none' 
                          ? 'border-emerald-200/80 bg-emerald-50/30 hover:border-emerald-500' 
                          : 'border-slate-200/90 hover:border-amber-500 hover:bg-amber-50/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 flex items-center gap-2">
                          {cond.id === 'none' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span>{cond.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pl-6">
                          {cond.desc}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BƯỚC 4: KẾT QUẢ PHÁC ĐỒ CHUẨN ĐÔI (NỘI ĐỊA VS NHẬP NGOẠI) */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                
                {/* Lời chẩn đoán dược học & Hướng dẫn y khoa */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 space-y-2.5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
                    <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide text-emerald-900">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Liệu Trình Bổ Trợ Cho: {activeConcern?.title}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                      Đối tượng: {currentAudience.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {activeConcern?.advice}
                  </p>

                  <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Lời khuyên chế độ sinh hoạt:</strong> {activeConcern?.lifestyle}
                    </div>
                  </div>

                  {/* Cảnh báo tương tác thuốc cá nhân hóa */}
                  {activeCondition && activeCondition.id !== 'none' && (
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-900">Lưu ý tương tác y khoa với: "{activeCondition.title}"</strong>
                        <div className="mt-0.5 text-[11px] text-amber-900/90 leading-relaxed font-medium">
                          {activeCondition.note}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2 LỰA CHỌN PHÁC ĐỒ SONG SONG: HÀNG NỘI ĐỊA VS HÀNG NHẬP KHẨU */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>2 Phương Án Bổ Trợ Chuẩn Y Khoa Cùng Công Năng:</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Chọn giải pháp phù hợp ngân sách</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* CỘT 1: HÀNG NỘI ĐỊA CHUẨN GMP-WHO */}
                    <div className="p-4 rounded-2xl border-2 border-rose-200 bg-gradient-to-b from-rose-50/50 to-white flex flex-col justify-between space-y-3 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                            🇻🇳 Hàng Nội Địa Chuẩn GMP-WHO
                          </span>
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            {domesticProduct.brand || 'Dược Liệu Việt'}
                          </span>
                        </div>
                        
                        <div className="flex gap-3 mt-3">
                          <img
                            src={domesticProduct.image}
                            alt={domesticProduct.name}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-extrabold text-xs text-slate-900 line-clamp-2">
                              {domesticProduct.name}
                            </h5>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-sm font-black text-rose-700">
                                {domesticProduct.price.toLocaleString('vi-VN')}₫
                              </span>
                              {domesticProduct.originalPrice > domesticProduct.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  {domesticProduct.originalPrice.toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                              ★ {domesticProduct.rating || 4.9} ({domesticProduct.soldCount || 1200}+ đã dùng)
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-rose-100">
                          <div>✓ Số ĐKSP: <strong className="font-mono text-slate-800">{domesticProduct.regNumber || 'Đã kiểm duyệt Bộ Y Tế'}</strong></div>
                          <div>✓ Quy cách: {domesticProduct.packaging || 'Hộp chuẩn'}</div>
                          <div>✓ Liều khuyên dùng: {domesticProduct.usage || 'Uống sau ăn 30 phút với nước ấm'}</div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-rose-100">
                        <button
                          onClick={() => handleAddComboToCart(domesticProduct, 3, 10)}
                          className="w-full py-2 px-3 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Chọn Liệu Trình 3 Hộp (Tiết kiệm 10%)</span>
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { onClose(); onOpenDetail(domesticProduct); }}
                            className="flex-1 py-1.5 text-xs font-bold rounded-lg border border-rose-200 text-rose-800 hover:bg-rose-50 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => { onAddToCart(domesticProduct, 1); onClose(); }}
                            className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors"
                          >
                            Mua thử 1 hộp
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CỘT 2: HÀNG NHẬP NGOẠI CHÍNH NGẠCH */}
                    <div className="p-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/50 to-white flex flex-col justify-between space-y-3 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                            {importedProduct.flag || '🌍'} Nhập Ngoại Chính Ngạch
                          </span>
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            {importedProduct.countryName || 'USA / Úc / Nhật'}
                          </span>
                        </div>
                        
                        <div className="flex gap-3 mt-3">
                          <img
                            src={importedProduct.image}
                            alt={importedProduct.name}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-extrabold text-xs text-slate-900 line-clamp-2">
                              {importedProduct.name}
                            </h5>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-sm font-black text-blue-700">
                                {importedProduct.price.toLocaleString('vi-VN')}₫
                              </span>
                              {importedProduct.originalPrice > importedProduct.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  {importedProduct.originalPrice.toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-blue-700 font-bold mt-0.5">
                              ★ {importedProduct.rating || 4.9} ({importedProduct.soldCount || 1500}+ đã dùng)
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-blue-100">
                          <div>✓ Số ĐKSP: <strong className="font-mono text-slate-800">{importedProduct.regNumber || 'Hải quan & BYT phê duyệt'}</strong></div>
                          <div>✓ Chuẩn hóa quốc tế: FDA / TGA / GMP-WHO</div>
                          <div>✓ Liều khuyên dùng: {importedProduct.usage || 'Uống 1-2 viên/ngày sau bữa ăn'}</div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-blue-100">
                        <button
                          onClick={() => handleAddComboToCart(importedProduct, 3, 10)}
                          className="w-full py-2 px-3 text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Chọn Liệu Trình 3 Hộp (Tiết kiệm 10%)</span>
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { onClose(); onOpenDetail(importedProduct); }}
                            className="flex-1 py-1.5 text-xs font-bold rounded-lg border border-blue-200 text-blue-800 hover:bg-blue-50 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => { onAddToCart(importedProduct, 1); onClose(); }}
                            className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors"
                          >
                            Mua thử 1 hộp
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Actions Wizard */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetWizard}
                      className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Khảo sát lại từ đầu
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Hỏi thêm Dược sĩ AI
                    </button>
                  </div>

                  <a
                    href={`tel:${(storeConfig?.hotline || '18006868').replace(/\s+/g, '')}`}
                    className="text-xs font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                    <span>Tổng đài Dược sĩ: {storeConfig?.hotline || '1800 6868'} (Miễn cước)</span>
                  </a>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* NỘI DUNG TAB 2: TRÒ CHUYỆN TRỰC TIẾP VỚI DƯỢC SĨ AI 24/7 (CHAT) */}
        {/* ============================================================== */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 overflow-hidden h-[540px]">
            
            {/* Thanh Ngữ Cảnh Tư Vấn Lâm Sàng (Context Bar) */}
            <div className="bg-slate-900 text-white px-3 sm:px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Ngữ cảnh:</span>
              </div>

              {/* Nhóm 1: Đối tượng cần tư vấn */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
                <span className="text-[10px] text-slate-400 font-medium shrink-0">Tư vấn cho:</span>
                {[
                  { id: 'auto', label: 'Tự động' },
                  { id: 'elderly', label: 'Bác 50+' },
                  { id: 'women', label: 'Phụ nữ' },
                  { id: 'men', label: 'Nam giới' },
                  { id: 'office', label: 'Văn phòng' },
                  { id: 'kids', label: 'Trẻ nhỏ' }
                ].map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setChatAudience(a.id)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                      chatAudience === a.id
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Nhóm 2: Bệnh lý nền cần lưu ý */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
                <span className="text-[10px] text-slate-400 font-medium shrink-0">Bệnh nền:</span>
                {[
                  { id: 'none', label: 'Không' },
                  { id: 'stomach', label: 'Dạ dày' },
                  { id: 'blood_pressure', label: 'Huyết áp' },
                  { id: 'diabetes', label: 'Tiểu đường' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChatCondition(c.id)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                      chatCondition === c.id
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick chips gợi ý câu hỏi theo đối tượng */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto whitespace-nowrap flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Gợi ý nhanh:
              </span>
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.query)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 shrink-0 transition-colors"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Khung tin nhắn cuộc trò chuyện */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%]">
                    {msg.sender === 'pharmacist' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-tr-none shadow-sm font-medium'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                    }`}>
                      {/* Hiển thị Markdown đơn giản cho tin nhắn dược sĩ */}
                      <div className="whitespace-pre-line space-y-2">
                        {msg.text.split('\n\n').map((para, pIdx) => {
                          if (para.startsWith('###')) {
                            return <h4 key={pIdx} className="font-extrabold text-sm sm:text-base text-emerald-900 border-b border-emerald-200 pb-1 mb-1">{para.replace(/###\s*/, '')}</h4>;
                          }
                          if (para.startsWith('>')) {
                            return (
                              <div key={pIdx} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-medium my-1">
                                {para.replace(/^>\s*/, '')}
                              </div>
                            );
                          }
                          return <p key={pIdx}>{para}</p>;
                        })}
                      </div>

                      {/* Hiển thị Card các sản phẩm đề xuất (nếu có) */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                          <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Gợi ý giải pháp bổ sung theo nhu cầu của bạn:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {msg.recommendedProducts.map((p) => (
                              <div 
                                key={p.id}
                                className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                    <span className={p.originType === 'domestic' ? 'text-rose-700' : 'text-blue-700'}>
                                      {p.originType === 'domestic' ? '🇻🇳 Chuẩn GMP-WHO' : `${p.flag || '🌍'} Nhập chính ngạch`}
                                    </span>
                                    <span className="text-slate-400">{p.brand}</span>
                                  </div>

                                  <div className="flex gap-2">
                                    <img 
                                      src={p.image} 
                                      alt={p.name} 
                                      className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0" 
                                    />
                                    <div className="min-w-0">
                                      <h6 className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</h6>
                                      <div className="text-xs font-black text-rose-700 mt-0.5">
                                        {p.price.toLocaleString('vi-VN')}₫
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-100">
                                  <button
                                    onClick={() => { onClose(); onOpenDetail(p); }}
                                    className="flex-1 py-1 text-[11px] font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                                  >
                                    Xem
                                  </button>
                                  <button
                                    onClick={() => { onAddToCart(p, 1); onClose(); }}
                                    className="flex-1 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-xs"
                                  >
                                    <ShoppingBag className="w-3 h-3" />
                                    <span>Chọn mua</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Chỉ báo AI đang suy nghĩ */}
              {isThinking && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-2xl w-fit border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-3 h-3 animate-spin" />
                  </div>
                  <span>Dược sĩ AI đang phân tích dữ liệu lâm sàng & kiểm tra tương tác thuốc...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Ô nhập tin nhắn trò chuyện */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Nhập triệu chứng, độ tuổi hoặc câu hỏi y khoa..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50 focus:bg-white"
                  disabled={isThinking}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isThinking}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Gửi câu hỏi</span>
                </button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
                <span>Dược sĩ AI hỗ trợ phân tích tương tác và đề xuất thực phẩm bảo vệ sức khỏe chuẩn hóa.</span>
                <span className="font-semibold text-emerald-700">Miễn phí 100%</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};