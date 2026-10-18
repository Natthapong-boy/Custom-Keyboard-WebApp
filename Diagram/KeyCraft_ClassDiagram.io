<mxfile host="app.diagrams.net" modified="2026-10-18T20:50:00.000Z" agent="Antigravity" version="24.0.0" type="device">
  <diagram name="KeyCraft Class Diagram" id="keycraft-class-diagram">
    <mxGraphModel dx="1400" dy="1600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Outer Canvas Frame -->
        <mxCell id="frame" parent="1" style="swimlane;startSize=32;fontStyle=1;fontSize=15;fontColor=#3b0764;fillColor=#faf5ff;strokeColor=#c4b5fd;strokeWidth=1.5;rounded=1;arcSize=6;" value="Class Diagram: ระบบประกอบและจัดจำหน่ายคีย์บอร์ดคัสตอมออนไลน์ KeyCraft" vertex="1">
          <mxGeometry x="30" y="30" width="1140" height="1020" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- 1. ADDRESS (Value Object)                  -->
        <!-- ========================================== -->
        <mxCell id="c_address" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#f8fafc;strokeColor=#94a3b8;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#334155;&quot;&gt;&amp;laquo;Value Object&amp;raquo;&lt;br/&gt;Address&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #cbd5e1;margin:6px 0;&quot;/&gt;+ street: String&lt;br/&gt;+ subdistrict: String&lt;br/&gt;+ district: String&lt;br/&gt;+ province: String&lt;br/&gt;+ postalCode: String&lt;br/&gt;+ phone: String&lt;hr style=&quot;border:none;border-top:1px solid #cbd5e1;margin:6px 0;&quot;/&gt;+ getFullAddress(): String" vertex="1">
          <mxGeometry x="40" y="60" width="190" height="180" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- 2. USER (Base Abstract Class)             -->
        <!-- ========================================== -->
        <mxCell id="c_user" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#faf5ff;strokeColor=#8b5cf6;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#4c1d95;&quot;&gt;User&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #ddd6fe;margin:6px 0;&quot;/&gt;# id: ObjectId&lt;br/&gt;# name: String&lt;br/&gt;# email: String&lt;br/&gt;# password: String&lt;br/&gt;# phone: String&lt;br/&gt;# avatar: String&lt;br/&gt;# role: String&lt;br/&gt;# lastLogin: Date&lt;hr style=&quot;border:none;border-top:1px solid #ddd6fe;margin:6px 0;&quot;/&gt;+ login(email, pwd): Token&lt;br/&gt;+ register(userData): User&lt;br/&gt;+ updateProfile(data): User&lt;br/&gt;+ matchPassword(pwd): Boolean" vertex="1">
          <mxGeometry x="270" y="60" width="210" height="200" as="geometry" />
        </mxCell>

        <!-- User * - 1 Address -->
        <mxCell id="e_user_address" edge="1" parent="frame" source="c_user" target="c_address" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#64748b;strokeWidth=1.5;endArrow=diamond;endFill=1;entryX=1;entryY=0.5;entryDx=0;entryDy=0;exitX=0;exitY=0.5;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_user_addr_card" connectable="0" parent="e_user_address" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#475569;" value="1" vertex="1">
          <mxGeometry relative="1" x="0.6" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- 3. CUSTOMER (Subclass of User)             -->
        <!-- ========================================== -->
        <mxCell id="c_customer" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#f5f3ff;strokeColor=#7c3aed;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#581c87;&quot;&gt;Customer&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #c4b5fd;margin:6px 0;&quot;/&gt;- googleId: String&lt;br/&gt;- shippingAddress: Address&lt;hr style=&quot;border:none;border-top:1px solid #c4b5fd;margin:6px 0;&quot;/&gt;+ createOrder(cart): Order&lt;br/&gt;+ uploadPaymentProof(id, slip): Boolean&lt;br/&gt;+ cancelOrder(id): Boolean&lt;br/&gt;+ writeReview(productId, rev): Review" vertex="1">
          <mxGeometry x="40" y="300" width="210" height="150" as="geometry" />
        </mxCell>

        <!-- Customer Generalization -> User -->
        <mxCell id="e_customer_user" edge="1" parent="frame" source="c_customer" target="c_user" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#7c3aed;strokeWidth=1.5;endArrow=block;endFill=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.25;entryY=1;entryDx=0;entryDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- 4. STAFF (Subclass of User)                -->
        <!-- ========================================== -->
        <mxCell id="c_staff" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#f5f3ff;strokeColor=#7c3aed;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#581c87;&quot;&gt;Staff&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #c4b5fd;margin:6px 0;&quot;/&gt;- employeeId: String&lt;br/&gt;- accountType: String&lt;hr style=&quot;border:none;border-top:1px solid #c4b5fd;margin:6px 0;&quot;/&gt;+ updateOrderStatus(id, status): Order&lt;br/&gt;+ manageProduct(productData): Product&lt;br/&gt;+ viewReports(): ReportData&lt;br/&gt;+ verifySlip(id): SlipResult" vertex="1">
          <mxGeometry x="270" y="300" width="220" height="150" as="geometry" />
        </mxCell>

        <!-- Staff Generalization -> User -->
        <mxCell id="e_staff_user" edge="1" parent="frame" source="c_staff" target="c_user" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#7c3aed;strokeWidth=1.5;endArrow=block;endFill=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- 5. CATEGORY                                -->
        <!-- ========================================== -->
        <mxCell id="c_category" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#fdf4ff;strokeColor=#d946ef;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#701a75;&quot;&gt;Category&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #f5d0fe;margin:6px 0;&quot;/&gt;- id: ObjectId&lt;br/&gt;- name: String&lt;br/&gt;- slug: String&lt;br/&gt;- icon: String&lt;br/&gt;- isActive: Boolean&lt;hr style=&quot;border:none;border-top:1px solid #f5d0fe;margin:6px 0;&quot;/&gt;+ getProducts(): Product[]" vertex="1">
          <mxGeometry x="580" y="60" width="180" height="150" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- 6. PRODUCT & PARTS                         -->
        <!-- ========================================== -->
        <mxCell id="c_product" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#f0fdf4;strokeColor=#16a34a;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#14532d;&quot;&gt;Product&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #bbf7d0;margin:6px 0;&quot;/&gt;- id: ObjectId&lt;br/&gt;- name: String&lt;br/&gt;- category: String&lt;br/&gt;- brand: String&lt;br/&gt;- price: Number&lt;br/&gt;- stock: Number&lt;br/&gt;- inStock: Boolean&lt;br/&gt;- image: String&lt;br/&gt;- partType: String&lt;br/&gt;- layout: String&lt;br/&gt;- switchType: String&lt;br/&gt;- mountType: String&lt;hr style=&quot;border:none;border-top:1px solid #bbf7d0;margin:6px 0;&quot;/&gt;+ isAvailable(): Boolean&lt;br/&gt;+ deductStock(qty): void&lt;br/&gt;+ updateDetails(data): void" vertex="1">
          <mxGeometry x="840" y="60" width="240" height="250" as="geometry" />
        </mxCell>

        <!-- Category 1 - * Product -->
        <mxCell id="e_category_product" edge="1" parent="frame" source="c_category" target="c_product" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#d946ef;strokeWidth=1.5;endArrow=open;entryX=0;entryY=0.35;entryDx=0;entryDy=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_cat_prod_mult" connectable="0" parent="e_category_product" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#86198f;" value="1       *" vertex="1">
          <mxGeometry relative="1" x="0.05" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- 7. REVIEW                                  -->
        <!-- ========================================== -->
        <mxCell id="c_review" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#fffbeb;strokeColor=#f59e0b;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#78350f;&quot;&gt;Review&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #fde68a;margin:6px 0;&quot;/&gt;- id: ObjectId&lt;br/&gt;- rating: Number&lt;br/&gt;- comment: String&lt;br/&gt;- soundExperience: String&lt;br/&gt;- verifiedPurchase: Boolean&lt;br/&gt;- createdAt: Date&lt;hr style=&quot;border:none;border-top:1px solid #fde68a;margin:6px 0;&quot;/&gt;+ getSummary(): String" vertex="1">
          <mxGeometry x="870" y="350" width="210" height="150" as="geometry" />
        </mxCell>

        <!-- Product 1 - * Review -->
        <mxCell id="e_product_review" edge="1" parent="frame" source="c_product" target="c_review" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#f59e0b;strokeWidth=1.5;endArrow=open;entryX=0.5;entryY=0;entryDx=0;entryDy=0;exitX=0.62;exitY=1;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_prod_rev_mult" connectable="0" parent="e_product_review" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#b45309;" value="1           *" vertex="1">
          <mxGeometry relative="1" x="0.05" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- Customer 1 - * Review -->
        <mxCell id="e_customer_review" edge="1" parent="frame" source="c_customer" target="c_review" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#94a3b8;strokeWidth=1.5;endArrow=open;entryX=0;entryY=0.5;entryDx=0;entryDy=0;exitX=0.9;exitY=1;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="229" y="475" />
              <mxPoint x="800" y="475" />
              <mxPoint x="800" y="425" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="lbl_cust_rev_mult" connectable="0" parent="e_customer_review" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#64748b;" value="writes &amp;gt;" vertex="1">
          <mxGeometry relative="1" x="0.3" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- 8. ORDER (Central Transaction Entity)      -->
        <!-- ========================================== -->
        <mxCell id="c_order" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#faf5ff;strokeColor=#7c3aed;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#4c1d95;&quot;&gt;Order&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #c4b5fd;margin:6px 0;&quot;/&gt;- orderId: String&lt;br/&gt;- orderType: String (prebuilt | custom)&lt;br/&gt;- status: OrderStatus&lt;br/&gt;- customerInfo: CustomerInfo&lt;br/&gt;- subtotal: Number&lt;br/&gt;- discount: Number&lt;br/&gt;- shipping: Number&lt;br/&gt;- total: Number&lt;br/&gt;- trackingNumber: String&lt;br/&gt;- paymentProof: String&lt;br/&gt;- createdAt: Date&lt;hr style=&quot;border:none;border-top:1px solid #c4b5fd;margin:6px 0;&quot;/&gt;+ calculateTotal(): Number&lt;br/&gt;+ updateStatus(newStatus): void&lt;br/&gt;+ lockOrder(): void&lt;br/&gt;+ generateReceipt(): Receipt" vertex="1">
          <mxGeometry x="320" y="520" width="230" height="260" as="geometry" />
        </mxCell>

        <!-- Customer 1 - * Order -->
        <mxCell id="e_customer_order" edge="1" parent="frame" source="c_customer" target="c_order" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#7c3aed;strokeWidth=1.5;endArrow=open;entryX=0;entryY=0.25;entryDx=0;entryDy=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="145" y="585" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="lbl_cust_order" connectable="0" parent="e_customer_order" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#6b21a8;" value="places 1..*" vertex="1">
          <mxGeometry relative="1" x="0.1" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- Staff - Order (Staff manages Orders) -->
        <mxCell id="e_staff_order" edge="1" parent="frame" source="c_staff" target="c_order" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#7c3aed;strokeWidth=1.5;endArrow=open;entryX=0.5;entryY=0;entryDx=0;entryDy=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_staff_order" connectable="0" parent="e_staff_order" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#6b21a8;" value="manages &amp;gt;" vertex="1">
          <mxGeometry relative="1" x="-0.1" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- 9. ORDER ITEM (Composition with Order)     -->
        <!-- ========================================== -->
        <mxCell id="c_order_item" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#eff6ff;strokeColor=#3b82f6;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#1e3a8a;&quot;&gt;OrderItem&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #bfdbfe;margin:6px 0;&quot;/&gt;- name: String&lt;br/&gt;- price: Number&lt;br/&gt;- quantity: Number&lt;br/&gt;- specs: String&lt;br/&gt;- image: String&lt;br/&gt;- switchSound: String&lt;hr style=&quot;border:none;border-top:1px solid #bfdbfe;margin:6px 0;&quot;/&gt;+ getItemTotal(): Number" vertex="1">
          <mxGeometry x="630" y="550" width="190" height="170" as="geometry" />
        </mxCell>

        <!-- Order 1 * - 1..* OrderItem (Composition) -->
        <mxCell id="e_order_items" edge="1" parent="frame" source="c_order" target="c_order_item" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#3b82f6;strokeWidth=1.5;endArrow=diamond;endFill=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;exitX=1;exitY=0.45;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_order_items_mult" connectable="0" parent="e_order_items" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#1d4ed8;" value="1          1..*" vertex="1">
          <mxGeometry relative="1" x="0.05" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- OrderItem - Product -->
        <mxCell id="e_item_product" edge="1" parent="frame" source="c_order_item" target="c_product" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#16a34a;strokeWidth=1.5;endArrow=open;entryX=0.25;entryY=1;entryDx=0;entryDy=0;exitX=0.85;exitY=0;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_item_product" connectable="0" parent="e_item_product" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#15803d;" value="references &amp;gt;" vertex="1">
          <mxGeometry relative="1" x="-0.1" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- 10. SELECTED PART (Custom Keyboard Parts)  -->
        <!-- ========================================== -->
        <mxCell id="c_selected_part" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#ecfeff;strokeColor=#06b6d4;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#164e63;&quot;&gt;SelectedPart&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #a5f3fc;margin:6px 0;&quot;/&gt;- type: String (case|switch|plate|keycap)&lt;br/&gt;- name: String&lt;br/&gt;- color: String&lt;br/&gt;- secondaryColor: String&lt;br/&gt;- price: Number&lt;br/&gt;- image: String&lt;hr style=&quot;border:none;border-top:1px solid #a5f3fc;margin:6px 0;&quot;/&gt;+ getPartInfo(): String" vertex="1">
          <mxGeometry x="890" y="550" width="220" height="170" as="geometry" />
        </mxCell>

        <!-- OrderItem 1 * - 0..* SelectedPart (Composition) -->
        <mxCell id="e_item_parts" edge="1" parent="frame" source="c_order_item" target="c_selected_part" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#06b6d4;strokeWidth=1.5;endArrow=diamond;endFill=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_item_parts_mult" connectable="0" parent="e_item_parts" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#0e7490;" value="1            0..4" vertex="1">
          <mxGeometry relative="1" x="0.05" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- 11. PAYMENT (PromptPay / SlipOK)           -->
        <!-- ========================================== -->
        <mxCell id="c_payment" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#ecfdf5;strokeColor=#10b981;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#064e3b;&quot;&gt;Payment&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #a7f3d0;margin:6px 0;&quot;/&gt;- method: String = &quot;PromptPay&quot;&lt;br/&gt;- promptPayAccount: String&lt;br/&gt;- qrExpiresAt: Date&lt;br/&gt;- verifiedAmount: Number&lt;br/&gt;- transactionId: String&lt;br/&gt;- isVerified: Boolean&lt;hr style=&quot;border:none;border-top:1px solid #a7f3d0;margin:6px 0;&quot;/&gt;+ generatePromptPayQr(amount): QrData&lt;br/&gt;+ verifySlipWithSlipOK(slip): SlipResult" vertex="1">
          <mxGeometry x="40" y="650" width="220" height="170" as="geometry" />
        </mxCell>

        <!-- Order 1 - 1 Payment -->
        <mxCell id="e_order_payment" edge="1" parent="frame" source="c_order" target="c_payment" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#10b981;strokeWidth=1.5;endArrow=open;entryX=1;entryY=0.45;entryDx=0;entryDy=0;exitX=0;exitY=0.75;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_order_payment" connectable="0" parent="e_order_payment" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#047857;" value="1           1" vertex="1">
          <mxGeometry relative="1" x="0.05" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- 12. RECEIPT                                -->
        <!-- ========================================== -->
        <mxCell id="c_receipt" parent="frame" style="html=1;whiteSpace=wrap;rounded=1;arcSize=8;fillColor=#fdf2f8;strokeColor=#ec4899;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;spacingRight=10;" value="&lt;p style=&quot;text-align:center;margin:0;font-weight:bold;font-size:13px;color:#831843;&quot;&gt;Receipt&lt;/p&gt;&lt;hr style=&quot;border:none;border-top:1px solid #fbcfe8;margin:6px 0;&quot;/&gt;- receiptNo: String&lt;br/&gt;- orderId: String&lt;br/&gt;- customerName: String&lt;br/&gt;- issueDate: Date&lt;br/&gt;- totalAmount: Number&lt;hr style=&quot;border:none;border-top:1px solid #fbcfe8;margin:6px 0;&quot;/&gt;+ printReceipt(): void&lt;br/&gt;+ exportPdf(): Blob" vertex="1">
          <mxGeometry x="340" y="850" width="190" height="140" as="geometry" />
        </mxCell>

        <!-- Order 1 - 0..1 Receipt -->
        <mxCell id="e_order_receipt" edge="1" parent="frame" source="c_order" target="c_receipt" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#ec4899;strokeWidth=1.5;endArrow=open;entryX=0.5;entryY=0;entryDx=0;entryDy=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" value="">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="lbl_order_receipt" connectable="0" parent="e_order_receipt" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=10;fontColor=#be185d;" value="1       0..1" vertex="1">
          <mxGeometry relative="1" x="0.1" y="-10" as="geometry"><mxPoint as="offset" /></mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
